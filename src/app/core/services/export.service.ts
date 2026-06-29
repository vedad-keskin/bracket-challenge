import { Injectable, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

type StyleSnapshot = {
  element: HTMLElement;
  overflow: string;
  width: string;
  maxWidth: string;
  justifyContent: string;
  padding: string;
  alignItems: string;
  flexDirection: string;
  marginBottom: string;
  animation: string;
  opacity: string;
  transform: string;
};

@Injectable({ providedIn: 'root' })
export class ExportService {
  private readonly document = inject(DOCUMENT);

  async exportBracketAsImage(element: HTMLElement): Promise<void> {
    const html2canvas = (await import('html2canvas')).default;
    const restore = this.prepareForCapture(element);

    try {
      const { width, height } = this.getCaptureDimensions(element);

      const canvas = await html2canvas(element, {
        backgroundColor: '#0a0e17',
        scale: 2,
        useCORS: true,
        allowTaint: true,
        logging: false,
        width,
        height,
        windowWidth: width,
        windowHeight: height,
        scrollX: 0,
        scrollY: 0,
        x: 0,
        y: 0,
      });

      const blob = await new Promise<Blob | null>((resolve) =>
        canvas.toBlob(resolve, 'image/png')
      );

      if (!blob) return;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], 'bracket-prediction-2026.png', {
          type: 'image/png',
        });
        const shareData = { files: [file], title: 'My World Cup 2026 Bracket' };

        if (navigator.canShare(shareData)) {
          try {
            await navigator.share(shareData);
            return;
          } catch {
            // User cancelled or share failed, fall through to download
          }
        }
      }

      const url = URL.createObjectURL(blob);
      const a = this.document.createElement('a');
      a.href = url;
      a.download = 'bracket-prediction-2026.png';
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      restore();
    }
  }

  private getCaptureDimensions(element: HTMLElement): { width: number; height: number } {
    return {
      width: element.scrollWidth,
      height: element.scrollHeight,
    };
  }

  private prepareForCapture(element: HTMLElement): () => void {
    const snapshots: StyleSnapshot[] = [];

    const snapshot = (el: HTMLElement) => {
      snapshots.push({
        element: el,
        overflow: el.style.overflow,
        width: el.style.width,
        maxWidth: el.style.maxWidth,
        justifyContent: el.style.justifyContent,
        padding: el.style.padding,
        alignItems: el.style.alignItems,
        flexDirection: el.style.flexDirection,
        marginBottom: el.style.marginBottom,
        animation: el.style.animation,
        opacity: el.style.opacity,
        transform: el.style.transform,
      });
    };

    const freezeForCapture = (el: HTMLElement) => {
      snapshot(el);
      el.style.animation = 'none';
      el.style.opacity = '1';
      el.style.transform = 'none';
    };

    const applyCaptureStyles = (el: HTMLElement) => {
      el.style.overflow = 'visible';
      el.style.maxWidth = 'none';
    };

    snapshot(this.document.documentElement);
    snapshot(this.document.body);
    applyCaptureStyles(this.document.documentElement);
    applyCaptureStyles(this.document.body);

    let parent: HTMLElement | null = element.parentElement;
    while (parent) {
      snapshot(parent);
      applyCaptureStyles(parent);
      parent = parent.parentElement;
    }

    snapshot(element);
    applyCaptureStyles(element);
    element.style.width = 'max-content';
    element.style.padding = '20px';
    element.style.background = '#0a0e17';

    const exportHeader = element.querySelector<HTMLElement>('.export-header');
    if (exportHeader) {
      snapshot(exportHeader);
      exportHeader.style.display = 'flex';
      exportHeader.style.flexDirection = 'column';
      exportHeader.style.alignItems = 'center';
      exportHeader.style.gap = '16px';
      exportHeader.style.marginBottom = '20px';
      exportHeader.style.width = '100%';
    }

    const scoringWrapper = element.querySelector<HTMLElement>('.scoring-wrapper');
    if (scoringWrapper) {
      snapshot(scoringWrapper);
      scoringWrapper.style.maxWidth = 'none';
      scoringWrapper.style.width = '100%';
      scoringWrapper.style.marginBottom = '0';
    }

    const championBanners = element.querySelectorAll<HTMLElement>('.champion-banner');
    championBanners.forEach((banner) => {
      freezeForCapture(banner);
      banner.style.marginBottom = '0';
    });

    const thirdPlaceBanners = element.querySelectorAll<HTMLElement>('.third-place-banner');
    thirdPlaceBanners.forEach((banner) => freezeForCapture(banner));

    element.querySelectorAll<HTMLElement>('.champion-trophy, .trophy-icon').forEach(freezeForCapture);

    const desktop = element.querySelector<HTMLElement>('.bracket-desktop');
    if (desktop) {
      snapshot(desktop);
      desktop.style.overflow = 'visible';
      desktop.style.width = 'max-content';
      desktop.style.maxWidth = 'none';
      desktop.style.justifyContent = 'flex-start';
      desktop.style.padding = '0';
    }

    const mobile = element.querySelector<HTMLElement>('.bracket-mobile');
    if (mobile) {
      snapshot(mobile);
      mobile.style.overflow = 'visible';
      mobile.style.width = 'max-content';
      mobile.style.maxWidth = 'none';
      mobile.style.padding = '0';
    }

    window.scrollTo(0, 0);
    element.getBoundingClientRect();

    return () => {
      for (const snap of snapshots) {
        snap.element.style.overflow = snap.overflow;
        snap.element.style.width = snap.width;
        snap.element.style.maxWidth = snap.maxWidth;
        snap.element.style.justifyContent = snap.justifyContent;
        snap.element.style.padding = snap.padding;
        snap.element.style.alignItems = snap.alignItems;
        snap.element.style.flexDirection = snap.flexDirection;
        snap.element.style.marginBottom = snap.marginBottom;
        snap.element.style.animation = snap.animation;
        snap.element.style.opacity = snap.opacity;
        snap.element.style.transform = snap.transform;
        if (snap.element === element) {
          snap.element.style.background = '';
        }
      }
    };
  }
}
