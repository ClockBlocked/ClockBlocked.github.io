// Breadcrumb Border Handler Module
// Adds scrolled class to breadcrumb when page is scrolled

export function initBreadcrumbBorder() {
  const breadcrumb = document.querySelector('.breadcrumb-wrapper');
  const pageWrapper = document.getElementById('pageWrapper');
  
  if (!breadcrumb || !pageWrapper) {
    console.warn('Breadcrumb or page wrapper not found');
    return;
  }

  function updateBreadcrumb() {
    const scrollTop = pageWrapper.scrollTop || document.documentElement.scrollTop;
    
    if (scrollTop > 10) {
      breadcrumb.classList.add('scrolled');
    } else {
      breadcrumb.classList.remove('scrolled');
    }
  }
  
  pageWrapper.addEventListener('scroll', updateBreadcrumb, { passive: true });
  updateBreadcrumb();
}

// Reinitialize on dynamic content changes
if (typeof MutationObserver !== 'undefined') {
  const observer = new MutationObserver(function(mutations) {
    mutations.forEach(function(mutation) {
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        setTimeout(initBreadcrumbBorder, 50);
      }
    });
  });
  
  // Start observing when DOM is ready
  document.addEventListener('DOMContentLoaded', () => {
    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  });
}
