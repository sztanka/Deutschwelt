/* Deutschwelt — «Wer ist es?»: tegnede ansikter (SVG) laget ut fra egenskapene. Alle figurene er originale. */
(function () {
  'use strict';
  var HAIR = { blond: '#e6bd4f', braun: '#7b4a2a', schwarz: '#2a2421', rot: '#c4552b', grau: '#b8bcc2' };
  var EYE = { blau: '#3d83c6', braun: '#6a3d1c', gruen: '#3f9b55' };
  var SKIN = ['#f5d3b5', '#e9b995', '#f8dcc4', '#d9a577', '#c68863', '#f1c8a5'];
  var SHIRT = ['#e57373', '#64b5f6', '#81c784', '#ffb74d', '#ba68c8', '#4db6ac', '#f06292', '#90a4ae', '#a1887f', '#7986cb'];
  var BG = ['#e8f1fb', '#fdf0e1', '#eaf6ea', '#f7e9f4', '#fff6d9', '#e6f4f3'];

  function face(c) {
    var sk = SKIN[(c.id * 5 + (c.g === 'f' ? 1 : 0)) % SKIN.length], hc = HAIR[c.hc], sh = SHIRT[(c.id * 3 + 1) % SHIRT.length], bg = BG[c.id % BG.length];
    var h = '<svg viewBox="0 0 100 112" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + c.name + '"><rect width="100" height="112" fill="' + bg + '"/>';
    // langt hår bak
    if (c.hl === 'lang') h += '<path d="M19 58 Q15 14 50 13 Q85 14 81 58 L86 104 L14 104 Z" fill="' + hc + '"/>';
    // skuldre / klær
    h += '<path d="M6 112 Q8 88 34 84 L66 84 Q92 88 94 112 Z" fill="' + sh + '"/>';
    h += '<rect x="42" y="74" width="16" height="14" rx="5" fill="' + sk + '"/>';
    // ører
    h += '<ellipse cx="25.5" cy="57" rx="4" ry="6" fill="' + sk + '"/><ellipse cx="74.5" cy="57" rx="4" ry="6" fill="' + sk + '"/>';
    if (c.earrings) h += '<circle cx="25" cy="65.5" r="2.6" fill="#f0c230" stroke="#b78a10" stroke-width=".6"/><circle cx="75" cy="65.5" r="2.6" fill="#f0c230" stroke="#b78a10" stroke-width=".6"/>';
    // hode
    h += '<ellipse cx="50" cy="52" rx="24.5" ry="28.5" fill="' + sk + '"/>';
    // hår foran
    if (c.hl === 'kurz') h += '<path d="M25 50 Q22 20 50 20 Q78 20 75 50 Q72 35 62 32 Q50 38 38 32 Q28 35 25 50Z" fill="' + hc + '"/>';
    else if (c.hl === 'lang') h += '<path d="M25 52 Q22 19 50 19 Q78 19 75 52 Q72 33 60 29 Q46 36 34 30 Q27 36 25 52Z" fill="' + hc + '"/>';
    else h += '<path d="M25 46 Q27 40 30 40 L30 52 Q25 52 25 46Z M75 46 Q73 40 70 40 L70 52 Q75 52 75 46Z" fill="' + hc + '" opacity=".9"/>';
    // skjegg
    if (c.beard) h += '<path d="M27 56 Q28 86 50 86 Q72 86 73 56 Q68 74 50 73 Q32 74 27 56Z" fill="' + hc + '"/>';
    // øyne
    var ec = EYE[c.eyes];
    [[40, 54], [60, 54]].forEach(function (p) { h += '<ellipse cx="' + p[0] + '" cy="' + p[1] + '" rx="5.2" ry="4.2" fill="#fff" stroke="#00000022" stroke-width=".5"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="2.9" fill="' + ec + '"/><circle cx="' + p[0] + '" cy="' + p[1] + '" r="1.3" fill="#111"/><circle cx="' + (p[0] + 1) + '" cy="' + (p[1] - 1) + '" r=".7" fill="#fff"/>'; });
    // øyenbryn
    var bc = c.hl === 'glatze' && c.hc === 'grau' ? '#8e9298' : hc;
    h += '<path d="M34 46 Q40 43 46 46" stroke="' + bc + '" stroke-width="' + (c.g === 'm' ? 2.6 : 1.7) + '" fill="none" stroke-linecap="round"/><path d="M54 46 Q60 43 66 46" stroke="' + bc + '" stroke-width="' + (c.g === 'm' ? 2.6 : 1.7) + '" fill="none" stroke-linecap="round"/>';
    // nese + fregner
    h += '<path d="M50 56 Q47 64 50 66 Q52 66.5 53 65" stroke="#00000044" stroke-width="1.3" fill="none" stroke-linecap="round"/>';
    if (c.freckles) [[38, 63], [41, 66], [44, 63], [56, 63], [59, 66], [62, 63]].forEach(function (p) { h += '<circle cx="' + p[0] + '" cy="' + p[1] + '" r="1" fill="#b5724a"/>'; });
    // munn
    if (c.smile) h += '<path d="M40 70 Q50 80 60 70" stroke="#a0382c" stroke-width="2.2" fill="#fff" stroke-linecap="round"/>';
    else h += '<path d="M43 72 Q50 74 57 72" stroke="#a0382c" stroke-width="2.2" fill="none" stroke-linecap="round"/>';
    // briller
    if (c.glasses) h += '<circle cx="40" cy="54" r="8" fill="#9ad1ff" fill-opacity=".18" stroke="#222" stroke-width="1.8"/><circle cx="60" cy="54" r="8" fill="#9ad1ff" fill-opacity=".18" stroke="#222" stroke-width="1.8"/><path d="M48 54 L52 54" stroke="#222" stroke-width="1.8"/><path d="M32 53 L26 51 M68 53 L74 51" stroke="#222" stroke-width="1.5"/>';
    // hodeplagg
    if (c.hat === 'H') h += '<ellipse cx="50" cy="28" rx="35" ry="7" fill="#5b4636"/><path d="M30 28 Q30 6 50 6 Q70 6 70 28Z" fill="#6e5643"/><rect x="30" y="22" width="40" height="6" fill="#c0392b"/>';
    if (c.hat === 'M') h += '<path d="M24 36 Q22 8 50 8 Q78 8 76 36 Q50 28 24 36Z" fill="#3f6fb5"/><rect x="23" y="31" width="54" height="9" rx="4" fill="#2f5896"/><circle cx="50" cy="7" r="5" fill="#e8eef8"/>';
    return h + '</svg>';
  }
  window.DWWerArt = { face: face };
})();
