// Strictly portrait; a square viewport uses the landscape source.
export const portraitQuery = 'not all and (min-aspect-ratio: 1/1)';

// Inspected compositions in both approved 24fps videos: frames 42/84/138/222.
// These are interior visual stops, independent of the narrative start thresholds.
export const cinematicStops = [1.75, 3.5, 5.75, 9.25];

export const milestones = [
  {
    start: 0,
    title: 'Her hikâyenin bir başlangıcı vardır.',
    subtitle: 'Bizimki, sıradan bir anı özel kılma fikriyle başlıyor.',
    label: 'ÇEKİRDEK',
    imageAlt: 'Seramik kâsede kahve çekirdeklerine yaklaşan kadraj.',
  },
  {
    start: 0.3,
    title: 'Geçmişten gelen bir sıcaklık.',
    subtitle: 'Yâren, köklü kahve kültürünün samimiyetini bugünün dünyasına taşır.',
    label: 'CEZVE',
    imageAlt: 'Güneş ışığında bakır cezvenin dokusu.',
  },
  {
    start: 0.5,
    title: 'Hayata küçük bir ara.',
    subtitle:
      'Bazen kendimize, bazen sevdiklerimize ayırdığımız birkaç dakika her şeyi değiştirir.',
    label: 'FİNCAN',
    imageAlt: 'Seramik fincan ve yükselen kameradan masa görünümü.',
  },
  {
    start: 0.75,
    title: 'Her fincanda ortak bir hikâye.',
    subtitle:
      "Çünkü Yâren'de önemli olan yalnızca içtiğimiz kahve değil, onu kiminle paylaştığımızdır.",
    label: 'PAYLAŞIM',
    imageAlt: 'İkinci fincanın yerleştirildiği, paylaşıma hazır iki kişilik masa.',
  },
];

export function clampProgress(value) {
  return Math.max(0, Math.min(1, Number.isFinite(value) ? value : 0));
}

export function scrollProgress(scrollY, sectionTop, sectionHeight, viewportHeight) {
  const travel = sectionHeight - viewportHeight;
  return travel > 0 ? clampProgress((scrollY - sectionTop) / travel) : 0;
}

export function frameForProgress(progress, count) {
  return Math.round(clampProgress(progress) * Math.max(0, count - 1));
}

export function milestoneForProgress(progress) {
  const value = clampProgress(progress);
  return milestones.findLastIndex((milestone) => value >= milestone.start);
}
