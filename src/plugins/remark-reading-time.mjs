// import readingTime from 'reading-time';

// export default function remarkReadingTime() {
//   return (tree, file) => {
//     const stats = readingTime(String(file.value));
//     const minutes = Math.max(1, Math.ceil(stats.minutes));

//     // Injecte une ligne "⏱️ X min de lecture" en haut de la page
//     tree.children.unshift({
//       type: 'paragraph',
//       children: [{ type: 'text', value: `⏱️ ${minutes} min de lecture` }],
//     });

//     // (Optionnel) stocker aussi en frontmatter (utile plus tard)
//     file.data.astro = {
//       ...file.data.astro,
//       frontmatter: {
//         ...file.data.astro?.frontmatter,
//         readingTime: minutes,
//       },
//     };
//   };
// }
// import readingTime from 'reading-time';
// import { toString } from 'mdast-util-to-string';

// export default function remarkReadingTime() {
//   return (tree) => {
//     // garde-fous
//     if (!tree || !Array.isArray(tree.children)) return;

//     // calcule le temps sur le texte réellement rendu
//     const text = toString(tree);
//     const minutes = Math.max(1, Math.ceil(readingTime(text).minutes));

//     // ajoute une ligne en haut sans toucher au reste
//     tree.children.unshift({
//       type: 'paragraph',
//       children: [{ type: 'text', value: `⏱️ ${minutes} min de lecture` }],
//     });
//   };
// }


// import readingTime from 'reading-time';
// import { toString } from 'mdast-util-to-string';

// export default function remarkMetaInfo() {
//   return (tree, file) => {
//     if (!tree || !Array.isArray(tree.children)) return;

//     // Lecture
//     const text = toString(tree);
//     const minutes = Math.max(1, Math.ceil(readingTime(text).minutes));

//     // Date "created" depuis le frontmatter
//     const created = file?.data?.astro?.frontmatter?.created;

//     // Si pas de created dans le frontmatter, on n'affiche pas la date (ou fallback si tu veux)
//     const meta = created
//       ? `📅 ${created} · ⏱️ ${minutes} min de lecture`
//       : `⏱️ ${minutes} min de lecture`;

//     tree.children.unshift({
//       type: 'paragraph',
//       children: [{ type: 'text', value: meta }],
//     });
//   };
// }

import readingTime from "reading-time";
import { toString } from "mdast-util-to-string";

function formatDateFR(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
}

export default function remarkArticleMeta() {
  return (tree, file) => {
    if (!tree || !Array.isArray(tree.children)) return;

    // Temps de lecture
    const text = toString(tree);
    const minutes = Math.max(1, Math.ceil(readingTime(text).minutes));

    // Frontmatter
    const fm = file?.data?.astro?.frontmatter ?? {};
    const created = formatDateFR(fm.created);
    const updated = formatDateFR(fm.updated);

    const authorName = fm.author?.name;
    const authorRole = fm.author?.role;
    const authorAvatar = fm.author?.avatar;

    const updatedLine = updated ? `<div class="am-updated">Mis à jour le ${updated}</div>` : "";
    const publishedLine = created ? `<div class="am-published">Publié le ${created}</div>` : "";

    const avatarHtml = authorAvatar
      ? `<img class="am-avatar" src="${authorAvatar}" alt="${authorName ?? "Auteur"}" loading="lazy" />`
      : "";

    const nameHtml = authorName ? `<div class="am-name">${authorName}</div>` : "";
    const roleHtml = authorRole ? `<div class="am-role">${authorRole}</div>` : "";

    const html = `
<div class="article-meta">
  <div class="am-author">
    ${avatarHtml}
    <div class="am-author-text">
      ${nameHtml}
      ${roleHtml}
      ${updatedLine}
      ${publishedLine}
    </div>
  </div>
  <div class="am-reading">
    <span class="am-pill">⏱️ ${minutes} min de lecture</span>
  </div>
</div>
`;

    // Injecter juste après le H1 si présent
    const idxH1 = tree.children.findIndex((n) => n?.type === "heading" && n?.depth === 1);
    const insertAt = idxH1 >= 0 ? idxH1 + 1 : 0;

    tree.children.splice(insertAt, 0, { type: "html", value: html });
  };
}
