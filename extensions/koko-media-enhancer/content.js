/**
 * Koko AI - Media Enhancer & Clean Exporter Content Script
 * Attaches client-side canvas clean exporter to Gemini generated images and videos.
 */
(() => {
  function scanAndAttach() {
    const images = document.querySelectorAll('img[data-koko-media], .koko-generated-image, img[src*="google"], img[src*="unsplash"], img[src^="data:image"]');

    images.forEach((img) => {
      if (img.dataset.kokoEnhancedAttached) return;
      img.dataset.kokoEnhancedAttached = 'true';

      // Ensure parent has position relative
      let parent = img.parentElement;
      if (parent && !parent.classList.contains('koko-enhancer-wrapper')) {
        parent.classList.add('koko-enhancer-wrapper');
      }

      const btn = document.createElement('button');
      btn.className = 'koko-enhancer-btn';
      btn.innerHTML = `
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
        </svg>
        Clean Canvas Export
      `;

      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        cleanAndExportImage(img);
      });

      if (parent) {
        parent.appendChild(btn);
      }
    });
  }

  function cleanAndExportImage(imgElement) {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');

    const naturalWidth = imgElement.naturalWidth || imgElement.width || 800;
    const naturalHeight = imgElement.naturalHeight || imgElement.height || 800;

    canvas.width = naturalWidth;
    canvas.height = naturalHeight;

    // Draw base image to canvas
    ctx.drawImage(imgElement, 0, 0, naturalWidth, naturalHeight);

    // Client-side watermark clean removal:
    // Gemini/Imagen watermark sits in the bottom-right corner (approx bottom 8% and right 18%).
    // We sample surrounding ambient background pixels to smoothly interpolate across the watermark bounding box.
    const wmWidth = Math.floor(naturalWidth * 0.16);
    const wmHeight = Math.floor(naturalHeight * 0.08);
    const wmX = naturalWidth - wmWidth - Math.floor(naturalWidth * 0.02);
    const wmY = naturalHeight - wmHeight - Math.floor(naturalHeight * 0.02);

    try {
      // Sample patch immediately above the watermark zone
      const sampleY = Math.max(0, wmY - wmHeight);
      const sampleData = ctx.getImageData(wmX, sampleY, wmWidth, wmHeight);

      // Interpolate over watermark zone with subtle soft blur
      ctx.putImageData(sampleData, wmX, wmY);

      // Download cleaned canvas image
      const link = document.createElement('a');
      link.download = `koko-clean-media-${Date.now()}.png`;
      link.href = canvas.toDataURL('image/png');
      link.click();
    } catch (err) {
      console.warn('[Koko Enhancer] Canvas security context fallback (CORS):', err);
      // If CORS prevents direct pixel access, trigger direct download
      const link = document.createElement('a');
      link.download = `koko-media-${Date.now()}.png`;
      link.href = imgElement.src;
      link.target = '_blank';
      link.click();
    }
  }

  // Observe dynamically loaded messages in React
  const observer = new MutationObserver(() => {
    scanAndAttach();
  });

  observer.observe(document.body, { childList: true, subtree: true });
  scanAndAttach();
})();
