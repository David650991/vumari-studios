export function initVideos() {
  const videos = document.querySelectorAll('video[data-video]');
  if (!videos.length || !('IntersectionObserver' in window)) return;

  const observer = new IntersectionObserver(entries => {
    for (const entry of entries) {
      if (!entry.isIntersecting) continue;
      entry.target.preload = 'metadata';
      entry.target.load();
      observer.unobserve(entry.target);
    }
  }, { rootMargin: '600px 0px' });

  videos.forEach(video => observer.observe(video));
}
