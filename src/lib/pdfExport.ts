import zarodaLogo from '@/assets/zaroda-logo.png';

interface PdfOptions {
  title: string;
  subtitle?: string;
  filename?: string;
  orientation?: 'portrait' | 'landscape';
  fitToOnePage?: boolean;
}

export async function exportToPdf(elementId: string, options: PdfOptions) {
  const element = document.getElementById(elementId);
  if (!element) return;

  const { default: html2pdf } = await import('html2pdf.js');

  const wrapper = document.createElement('div');
  wrapper.style.padding = options.fitToOnePage ? '12px' : '20px';
  wrapper.style.fontFamily = 'Arial, Helvetica, sans-serif';
  wrapper.style.color = '#1a1a1a';

  const header = document.createElement('div');
  header.style.textAlign = 'center';
  header.style.marginBottom = options.fitToOnePage ? '12px' : '20px';
  header.style.borderBottom = '2px solid #1a5276';
  header.style.paddingBottom = options.fitToOnePage ? '10px' : '15px';

  const logoImg = document.createElement('img');
  logoImg.src = zarodaLogo;
  logoImg.style.height = options.fitToOnePage ? '44px' : '60px';
  logoImg.style.marginBottom = '8px';
  header.appendChild(logoImg);

  const brandName = document.createElement('div');
  brandName.textContent = 'ZARODA SOLUTIONS';
  brandName.style.fontSize = options.fitToOnePage ? '15px' : '18px';
  brandName.style.fontWeight = 'bold';
  brandName.style.color = '#1a5276';
  brandName.style.letterSpacing = '2px';
  brandName.style.marginBottom = '4px';
  header.appendChild(brandName);

  const titleEl = document.createElement('h2');
  titleEl.textContent = options.title;
  titleEl.style.fontSize = options.fitToOnePage ? '14px' : '16px';
  titleEl.style.fontWeight = 'bold';
  titleEl.style.margin = '8px 0 2px 0';
  titleEl.style.color = '#333';
  header.appendChild(titleEl);

  if (options.subtitle) {
    const subtitleEl = document.createElement('p');
    subtitleEl.textContent = options.subtitle;
    subtitleEl.style.fontSize = options.fitToOnePage ? '11px' : '12px';
    subtitleEl.style.color = '#666';
    subtitleEl.style.margin = '0';
    header.appendChild(subtitleEl);
  }

  const dateEl = document.createElement('p');
  dateEl.textContent = `Generated on: ${new Date().toLocaleDateString('en-GB', { day: '2-digit', month: 'long', year: 'numeric' })}`;
  dateEl.style.fontSize = '10px';
  dateEl.style.color = '#999';
  dateEl.style.margin = '6px 0 0 0';
  header.appendChild(dateEl);

  wrapper.appendChild(header);

  const content = element.cloneNode(true) as HTMLElement;
  content.querySelectorAll('.no-print').forEach(el => el.remove());

  const tables = content.querySelectorAll('table');
  tables.forEach(table => {
    (table as HTMLElement).style.width = '100%';
    (table as HTMLElement).style.borderCollapse = 'collapse';
    (table as HTMLElement).style.fontSize = options.fitToOnePage ? '9px' : '11px';
    table.querySelectorAll('th, td').forEach(cell => {
      (cell as HTMLElement).style.border = '1px solid #ddd';
      (cell as HTMLElement).style.padding = options.fitToOnePage ? '4px 5px' : '6px 8px';
      (cell as HTMLElement).style.textAlign = 'left';
    });
    table.querySelectorAll('th').forEach(th => {
      (th as HTMLElement).style.backgroundColor = '#1a5276';
      (th as HTMLElement).style.color = '#fff';
      (th as HTMLElement).style.fontWeight = 'bold';
    });
  });

  wrapper.appendChild(content);

  const footer = document.createElement('div');
  footer.style.textAlign = 'center';
  footer.style.marginTop = options.fitToOnePage ? '10px' : '20px';
  footer.style.paddingTop = '10px';
  footer.style.borderTop = '1px solid #ddd';
  footer.style.fontSize = '9px';
  footer.style.color = '#999';
  footer.textContent = `© ${new Date().getFullYear()} Zaroda Solutions | School Management Platform | +254 781 230 805`;
  wrapper.appendChild(footer);

  const isLandscape = options.orientation === 'landscape';
  const orientation: 'landscape' | 'portrait' = isLandscape ? 'landscape' : 'portrait';
  const margin: [number, number, number, number] = [10, 10, 10, 10];

  if (options.fitToOnePage) {
    const pageWidthMm = isLandscape ? 297 : 210;
    const pageHeightMm = isLandscape ? 210 : 297;
    const usableWidthMm = pageWidthMm - margin[1] - margin[3];
    const usableHeightMm = pageHeightMm - margin[0] - margin[2];
    const pxPerMm = 96 / 25.4;

    const measureContainer = document.createElement('div');
    measureContainer.style.position = 'fixed';
    measureContainer.style.left = '-100000px';
    measureContainer.style.top = '0';
    measureContainer.style.width = `${usableWidthMm * pxPerMm}px`;
    measureContainer.style.pointerEvents = 'none';
    measureContainer.appendChild(wrapper);
    document.body.appendChild(measureContainer);

    const rawWidth = wrapper.scrollWidth;
    const rawHeight = wrapper.scrollHeight;
    const widthScale = (usableWidthMm * pxPerMm) / rawWidth;
    const heightScale = (usableHeightMm * pxPerMm) / rawHeight;
    const scale = Math.min(1, widthScale, heightScale);

    if (scale < 1) {
      wrapper.style.transformOrigin = 'top left';
      wrapper.style.transform = `scale(${scale})`;
      wrapper.style.width = `${rawWidth}px`;
      wrapper.style.height = `${rawHeight}px`;
    }

    document.body.removeChild(measureContainer);
  }

  const opt = {
    margin,
    filename: options.filename || `${options.title.replace(/\s+/g, '_')}.pdf`,
    image: { type: 'jpeg' as const, quality: 0.98 },
    html2canvas: { scale: options.fitToOnePage ? 1.5 : 2, useCORS: true, logging: false },
    pagebreak: { mode: options.fitToOnePage ? 'avoid-all' : ['css', 'legacy'] },
    jsPDF: { unit: 'mm', format: 'a4', orientation },
  };

  html2pdf().set(opt).from(wrapper).save();
}
