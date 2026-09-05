// Shared content for soli.blue Pages Functions (chat + markdown discovery).
// Single source of truth for the resume, projects, and chat system prompt.
import pins from '../src/assets/pins.json' with { type: 'json' };
import resume from '../src/assets/resume.json' with { type: 'json' };
import projects from '../src/assets/projects.json' with { type: 'json' };
export { resume, projects };

export const systemPrompt = `You are an AI assistant on Soli's personal website (soli.blue). Your job is to answer questions about Soli in a friendly, concise, and helpful way.

IMPORTANT GUIDELINES:
- ONLY answer questions about Soli. If someone asks about anything else (coding help, general knowledge, other topics), politely decline and redirect them to ask about Soli instead. Example: "I'm here to tell you about Soli! Ask me about his projects, background, or interests."
- Be concise and conversational - this is a terminal interface
- Use short paragraphs, avoid walls of text
- If asked something not in the data, say you don't have that info
- Be friendly and personable
- Soli goes by "Soli" (not his full name)
- ALWAYS use markdown links when mentioning websites, social profiles, or projects. Examples:
  - Twitter: [Twitter](https://twitter.com/_xSoli)
  - GitHub: [GitHub](https://github.com/soliblue)
  - Manifold: [Manifold](https://manifold.markets/Soli)
  - Website: [soli.blue](https://soli.blue)
  - For projects with links, always link them: [goaudio](https://goaudio.ai)

SOLI'S DATA:

=== RESUME ===
${JSON.stringify(resume, null, 2)}

=== PROJECTS ===
${JSON.stringify(projects, null, 2)}

=== ABOUT SOLI ===
- Egyptian, moved to Germany in 2014 to study CS at RWTH Aachen
- Passionate about AI, education, and building products
- Loves prediction markets (active on Manifold)
- Interested in art, architecture (Hundertwasser, Gaudi), audiovisual art (Christopher Bauder)
- Enjoys fonts, apps, travel, and connecting with people
- Website: soli.blue | Twitter: @_xSoli | GitHub: soliblue`;

// Markdown content for agent discovery (served at /api/md/*)
export function generateMarkdown(path) {
  const pages = {
    '/': `# Soli — soli.blue

Egyptian AI engineer based in Germany. Passionate about AI, education, and building products.

## Currently
- **Staff AI Engineer** at [Knowunity](https://knowunity.com) — Building AI-powered educational products for 30 million students (Sep 2025–Present)

## Background
- B.Sc. & M.Sc. Computer Science, RWTH Aachen University
- Previously: Founder at [toy2life](https://toy2life.com), Founding CTO at [goaudio.ai](https://goaudio.ai), DACH Marketplace Ops Manager at [Uber](https://uber.com)
- Languages: Arabic (native), German (fluent), English (fluent), Spanish (B1)

## Interests
- AI, prediction markets ([Manifold](https://manifold.markets/Soli)), art & architecture (Hundertwasser, Gaudi), audiovisual art (Christopher Bauder), fonts, travel

## Links
- Website: [soli.blue](https://soli.blue)
- Twitter: [@_xSoli](https://twitter.com/_xSoli)
- GitHub: [soliblue](https://github.com/soliblue)

## Pages
- [Resume](https://soli.blue/resume)
- [Projects](https://soli.blue/projects)
- [Pins](https://soli.blue/pins) — Favorite quotes and books
`,

    '/resume': `# Soli — Resume

## Experience
${resume.experience.map(e => `### ${e.title} — [${e.subtitle}](${e.url || '#'})
${e.location ? `${e.location} | ` : ''}${e.start}–${e.end || 'Present'}
${e.description ? e.description : ''}`).join('\n\n')}

## Education
${resume.education.map(e => `### ${e.title} — ${e.subtitle}
${e.location ? `${e.location} | ` : ''}${e.start}–${e.end || 'Present'}`).join('\n\n')}

## Languages
${resume.languages.map(l => `- **${l.name}**: ${l.level}`).join('\n')}
`,

    '/projects': `# Soli — Projects

${projects.map(p => `## ${p.title} — ${p.subtitle} (${p.year})
${p.description}
- Status: ${p.status === 'graveyard' ? 'archived' : 'live'}
- Tags: ${p.tags.join(', ')}
${p.website ? `- Website: [${p.title}](${p.website})\n` : ''}${p.link ? `- ${p.linkLabel || 'Link'}: [${p.title}](${p.link})` : ''}${p.github ? `\n- GitHub: [${p.title}](${p.github})` : ''}`).join('\n\n')}
`,

    '/pins': `# Soli — Pins

A collection of Soli's favorite quotes and books.

## Quotes
${pins.filter(p => p.type === 'quote').map(p => `> ${p.message}\n> — ${p.author}`).join('\n\n')}

## Books
${pins.filter(p => p.type === 'book').map(p => `- **${p.title}**${p.subtitle ? ` — ${p.subtitle}` : ''} — ${p.author}`).join('\n')}
`,
  };

  // Theme homepages all serve the main page markdown
  if (['windows95', 'terminal', 'newspaper', 'wikipedia', 'animation', 'space', 'code-hop', 'home'].includes(path.replace(/^\//, ''))) {
    return pages['/'];
  }

  return pages[path] || null;
}
