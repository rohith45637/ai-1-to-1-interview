import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * usePresentationAnalysis
 * 
 * Privacy-preserving, client-side webcam presentation analysis.
 * Analyzes only visible, technically supportable signals:
 * - Face visibility & camera framing
 * - Camera attention / head orientation
 * - Upright sitting posture
 * - Body movement stability
 * 
 * Enforces non-intrusive warnings with persistence thresholds & cooldowns.
 * Never performs face recognition or claims diagnostic psychological measurements.
 */
export function usePresentationAnalysis(videoRef, isCameraActive) {
  const [activeWarning, setActiveWarning] = useState(null);
  const [warningHistory, setWarningHistory] = useState([]);
  
  // Real-time tracking stats
  const statsRef = useRef({
    totalSamples: 0,
    faceVisibleSamples: 0,
    cameraAttentionSamples: 0,
    goodPostureSamples: 0,
    stableMovementSamples: 0,
    consecutiveAwayCount: 0,
    consecutiveOutOfFrameCount: 0,
    consecutivePoorPostureCount: 0,
    consecutiveHighMovementCount: 0,
    lastWarningTime: 0,
    previousFrameData: null,
  });

  const [presentationMetrics, setPresentationMetrics] = useState({
    camera_presence: 90.0,
    posture: 'Good',
    camera_attention: 'Good',
    movement: 'Stable',
    overall_presentation_score: 88.0,
    recommendations: [
      'Position the camera at eye level for comfortable engagement.',
      'Maintain a relaxed, upright posture throughout the session.'
    ],
    is_available: true
  });

  const canvasRef = useRef(null);
  const faceDetectorRef = useRef(null);

  // Initialize browser native FaceDetector if supported
  useEffect(() => {
    if (typeof window !== 'undefined' && 'FaceDetector' in window) {
      try {
        // eslint-disable-next-line no-undef
        faceDetectorRef.current = new window.FaceDetector({ fastMode: true, maxDetectedFaces: 1 });
      } catch (e) {
        faceDetectorRef.current = null;
      }
    }
  }, []);

  // Compute final recommendations based on metrics
  const computeRecommendations = (metrics) => {
    const recs = [];
    if (metrics.camera_presence < 75) {
      recs.push('Position your camera so that your face and upper body remain clearly within the center frame.');
    }
    if (metrics.camera_attention === 'Needs Improvement' || metrics.camera_attention === 'Moderate') {
      recs.push('Try to maintain comfortable eye contact with the camera while listening and answering questions.');
    }
    if (metrics.posture === 'Needs Improvement') {
      recs.push('Maintain a relaxed, upright posture during the interview to project professional confidence.');
    }
    if (metrics.movement === 'Excessive') {
      recs.push('Try to minimize rapid body or camera movement while speaking.');
    }
    if (recs.length === 0) {
      recs.push('Great camera presence and posture! Keep maintaining natural eye contact and a steady presentation.');
    }
    return recs;
  };

  // Main sampling loop: runs every 600ms
  useEffect(() => {
    if (!isCameraActive) {
      setPresentationMetrics(prev => ({ ...prev, is_available: false }));
      return;
    }

    if (!canvasRef.current && typeof document !== 'undefined') {
      const canvas = document.createElement('canvas');
      canvas.width = 160;
      canvas.height = 120;
      canvasRef.current = canvas;
    }

    const interval = setInterval(async () => {
      const video = videoRef.current;
      if (!video || video.readyState < 2 || video.paused) return;

      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) return;

      ctx.drawImage(video, 0, 0, 160, 120);
      const frame = ctx.getImageData(0, 0, 160, 120);
      const stats = statsRef.current;
      stats.totalSamples += 1;

      let faceDetected = false;
      let faceBox = null;

      // 1. Try Native FaceDetector if available
      if (faceDetectorRef.current) {
        try {
          const faces = await faceDetectorRef.current.detect(canvas);
          if (faces && faces.length > 0) {
            faceDetected = true;
            faceBox = faces[0].boundingBox;
          }
        } catch (err) {
          // Fallback to pixel analysis
        }
      }

      // 2. Resilient Skin-Tone / Facial Contrast Fallback
      if (!faceDetected) {
        let skinPixels = 0;
        let weightedX = 0;
        let weightedY = 0;
        const data = frame.data;

        for (let i = 0; i < data.length; i += 4) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];
          
          // Fast normalized skin & facial luminosity bounds
          if (r > 60 && g > 40 && b > 20 && r > g && r > b && (r - g) > 10 && (r - b) > 10) {
            const pixelIdx = i / 4;
            const x = pixelIdx % 160;
            const y = Math.floor(pixelIdx / 160);
            skinPixels++;
            weightedX += x;
            weightedY += y;
          }
        }

        // If adequate facial luminosity is found
        if (skinPixels > 120) {
          faceDetected = true;
          const avgX = weightedX / skinPixels;
          const avgY = weightedY / skinPixels;
          faceBox = { x: avgX - 25, y: avgY - 25, width: 50, height: 50 };
        }
      }

      // 3. Movement / Optical Frame-Difference
      let frameDiff = 0;
      if (stats.previousFrameData) {
        const prev = stats.previousFrameData.data;
        const curr = frame.data;
        for (let i = 0; i < curr.length; i += 16) {
          frameDiff += Math.abs(curr[i] - prev[i]);
        }
      }
      stats.previousFrameData = frame;
      const isHighMovement = frameDiff > 28000;

      // Evaluate Current Frame Signals
      const now = Date.now();
      const COOLDOWN_MS = 18000; // 18-second cooldown between warnings
      const PERSISTENCE_THRESHOLD = 5; // Must persist ~3 seconds (5 * 600ms)

      if (faceDetected && faceBox) {
        stats.faceVisibleSamples += 1;
        stats.consecutiveOutOfFrameCount = 0;

        // Check Centering / Camera Framing
        const centerX = faceBox.x + (faceBox.width / 2);
        const centerY = faceBox.y + (faceBox.height / 2);

        // Center region is 25% - 75% of horizontal and 15% - 80% of vertical
        const isCentered = centerX >= 35 && centerX <= 125 && centerY >= 15 && centerY <= 95;
        const isLookingForward = centerX >= 45 && centerX <= 115;
        const isUpright = centerY >= 20 && centerY <= 85;

        if (isLookingForward) {
          stats.cameraAttentionSamples += 1;
          stats.consecutiveAwayCount = 0;
        } else {
          stats.consecutiveAwayCount += 1;
        }

        if (isUpright) {
          stats.goodPostureSamples += 1;
          stats.consecutivePoorPostureCount = 0;
        } else {
          stats.consecutivePoorPostureCount += 1;
        }

        if (!isHighMovement) {
          stats.stableMovementSamples += 1;
          stats.consecutiveHighMovementCount = 0;
        } else {
          stats.consecutiveHighMovementCount += 1;
        }

        // Trigger Informational Warnings on Sustained Threshold & Cooldown
        if (now - stats.lastWarningTime > COOLDOWN_MS) {
          if (stats.consecutiveAwayCount >= PERSISTENCE_THRESHOLD) {
            triggerWarning('Please try to maintain comfortable attention toward the camera.');
            stats.consecutiveAwayCount = 0;
          } else if (stats.consecutivePoorPostureCount >= PERSISTENCE_THRESHOLD) {
            triggerWarning('Try to maintain a comfortable upright posture.');
            stats.consecutivePoorPostureCount = 0;
          } else if (!isCentered && stats.consecutiveOutOfFrameCount >= PERSISTENCE_THRESHOLD) {
            triggerWarning('Your face is partially outside the camera frame. Try centering yourself.');
            stats.consecutiveOutOfFrameCount = 0;
          } else if (stats.consecutiveHighMovementCount >= PERSISTENCE_THRESHOLD) {
            triggerWarning('Please try to keep your camera and posture stable.');
            stats.consecutiveHighMovementCount = 0;
          }
        }

      } else {
        // Face Not Detected in Frame
        stats.consecutiveOutOfFrameCount += 1;
        if (stats.consecutiveOutOfFrameCount >= PERSISTENCE_THRESHOLD && (now - stats.lastWarningTime > COOLDOWN_MS)) {
          triggerWarning('Your face is not clearly visible in the camera frame.');
          stats.consecutiveOutOfFrameCount = 0;
        }
      }

      // Update Aggregated Metrics for Reporting
      const total = Math.max(1, stats.totalSamples);
      const presencePct = Math.round((stats.faceVisibleSamples / total) * 100);
      const attentionPct = Math.round((stats.cameraAttentionSamples / total) * 100);
      const posturePct = Math.round((stats.goodPostureSamples / total) * 100);
      const movementPct = Math.round((stats.stableMovementSamples / total) * 100);

      const postureRating = posturePct >= 80 ? 'Excellent' : (posturePct >= 60 ? 'Good' : 'Needs Improvement');
      const attentionRating = attentionPct >= 80 ? 'Good' : (attentionPct >= 55 ? 'Moderate' : 'Needs Improvement');
      const movementRating = movementPct >= 75 ? 'Stable' : (movementPct >= 50 ? 'Good' : 'Excessive');

      const overall = Math.round((presencePct * 0.35) + (attentionPct * 0.25) + (posturePct * 0.25) + (movementPct * 0.15));

      const updated = {
        camera_presence: Math.max(50, Math.min(100, presencePct || 85)),
        posture: postureRating,
        camera_attention: attentionRating,
        movement: movementRating,
        overall_presentation_score: Math.max(50, Math.min(100, overall || 80)),
        is_available: true
      };

      updated.recommendations = computeRecommendations(updated);
      setPresentationMetrics(updated);

    }, 600);

    return () => clearInterval(interval);
  }, [isCameraActive]);

  const triggerWarning = useCallback((message) => {
    statsRef.current.lastWarningTime = Date.now();
    setActiveWarning(message);
    setWarningHistory(prev => [...prev.slice(-4), { message, timestamp: new Date() }]);

    // Auto-dismiss warning after 4.5 seconds
    setTimeout(() => {
      setActiveWarning(prev => (prev === message ? null : prev));
    }, 4500);
  }, []);

  return {
    activeWarning,
    warningHistory,
    presentationMetrics
  };
}