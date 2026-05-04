import { jsPDF } from "jspdf";
import type { Report } from "@/components/SeoReport";
import type { CrawlPage } from "@/components/CrawlResults";

export function exportReportToPdf(report: Report, crawl?: CrawlPage[] | null) {
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const pageW = doc.internal.pageSize.getWidth();
  const pageH = doc.internal.pageSize.getHeight();
  const margin = 48;
  let y = margin;

  const ensureSpace = (h: number) => {
    if (y + h > pageH - margin) {
      doc.addPage();
      y = margin;
    }
  };

  const heading = (text: string, size = 18) => {
    ensureSpace(size + 12);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(size);
    doc.setTextColor(20, 30, 50);
    doc.text(text, margin, y);
    y += size + 8;
  };

  const para = (text: string, size = 10, color: [number, number, number] = [60, 60, 70]) => {
    doc.setFont("helvetica", "normal");
    doc.setFontSize(size);
    doc.setTextColor(...color);
    const lines = doc.splitTextToSize(text, pageW - margin * 2);
    for (const line of lines) {
      ensureSpace(size + 4);
      doc.text(line, margin, y);
      y += size + 4;
    }
  };

  const divider = () => {
    ensureSpace(20);
    doc.setDrawColor(220, 225, 235);
    doc.line(margin, y, pageW - margin, y);
    y += 14;
  };

  // Title
  heading("SEO Audit Report", 22);
  para(report.url, 11, [20, 130, 130]);
  para(`Generated ${new Date().toLocaleString()}`, 9, [130, 130, 140]);
  y += 6;

  // Score box
  ensureSpace(80);
  const scoreColor: [number, number, number] = report.score >= 80 ? [40, 160, 90] : report.score >= 60 ? [220, 150, 30] : [210, 60, 60];
  doc.setFillColor(...scoreColor);
  doc.roundedRect(margin, y, 90, 60, 6, 6, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(28);
  doc.text(String(report.score), margin + 45, y + 32, { align: "center" });
  doc.setFontSize(9);
  doc.text(`Grade ${report.grade}`, margin + 45, y + 50, { align: "center" });

  doc.setTextColor(40, 40, 50);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);
  doc.text(`Critical: ${report.stats.critical}   Warnings: ${report.stats.warnings}   Passed: ${report.stats.passed}`, margin + 110, y + 24);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(80, 80, 95);
  const summaryLines = doc.splitTextToSize(report.summary, pageW - margin * 2 - 110);
  doc.text(summaryLines, margin + 110, y + 42);
  y += 80;
  divider();

  // Categories
  for (const cat of report.categories) {
    heading(`${cat.name} — Score ${cat.score}`, 14);
    const open = cat.issues.filter(i => i.severity !== "good");
    if (open.length === 0) {
      para("All checks passed in this category. ✓", 10, [40, 160, 90]);
    } else {
      for (const issue of open) {
        ensureSpace(40);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(10);
        const sevColor: [number, number, number] = issue.severity === "critical" ? [210, 60, 60] : issue.severity === "warning" ? [220, 150, 30] : [60, 110, 200];
        doc.setTextColor(...sevColor);
        doc.text(`[${issue.severity.toUpperCase()}] `, margin, y);
        const labelW = doc.getTextWidth(`[${issue.severity.toUpperCase()}] `);
        doc.setTextColor(20, 30, 50);
        const titleLines = doc.splitTextToSize(issue.title, pageW - margin * 2 - labelW);
        doc.text(titleLines, margin + labelW, y);
        y += titleLines.length * 12 + 4;
        if (issue.description) para(issue.description, 9, [80, 80, 95]);
        if (issue.recommendation) para(`Fix: ${issue.recommendation}`, 9, [40, 100, 100]);
        y += 4;
      }
    }
    divider();
  }

  // Crawl results
  if (crawl && crawl.length > 0) {
    heading("Other pages on this site", 14);
    const avg = Math.round(crawl.reduce((s, p) => s + p.score, 0) / crawl.length);
    para(`${crawl.length} pages crawled · Average score ${avg}`, 10);
    y += 4;
    for (const p of crawl) {
      ensureSpace(28);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.setTextColor(20, 30, 50);
      doc.text(`${p.score}  ${p.grade}`, margin, y);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(60, 60, 70);
      const urlLines = doc.splitTextToSize(p.url, pageW - margin * 2 - 60);
      doc.text(urlLines, margin + 60, y);
      y += Math.max(14, urlLines.length * 12) + 2;
      if (p.title) para(p.title, 9, [110, 110, 125]);
      if (!p.error) para(`Critical ${p.critical} · Warnings ${p.warnings} · Passed ${p.passed}`, 8, [130, 130, 140]);
      y += 2;
    }
  }

  // Footer page numbers
  const total = doc.getNumberOfPages();
  for (let i = 1; i <= total; i++) {
    doc.setPage(i);
    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setTextColor(160, 160, 170);
    doc.text(`Agent 00Seo · Page ${i} of ${total}`, pageW / 2, pageH - 20, { align: "center" });
  }

  const safeHost = report.url.replace(/^https?:\/\//, "").replace(/[^a-z0-9.-]/gi, "_").slice(0, 40);
  doc.save(`seo-report-${safeHost}-${Date.now()}.pdf`);
}
