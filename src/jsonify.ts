import chalk from "chalk";
import { parse, HTMLElement } from 'node-html-parser';

interface Output {
  content: Textbook;
}

interface Textbook {
  chapters: Chapter[];
  for: string;
  title?: string;
}

interface Chapter {
  html: string;
  sections: Section[];
  title: string;
}

interface Section {
  html: string;
  title: string;
}

const jsonify = async (o: Options) => {
  if (!o.url.startsWith("https://2012books.lardbucket.org/")) {
    console.error(chalk.stderr.red("URL must start with https://2012books.lardbucket.org/."));
    return;
  }

  const output: Output = {
    content: {
      for: "lecture",
      chapters: [],
    }
  };

  console.error(chalk.stderr.green(`Fetching ${o.url}...`));
  const response = await fetch(o.url);
  const html = await response.text();
  
  console.error(chalk.stderr.green(`Parsing HTML...`));
  const rootElement = parse(html);
  const contentElement = rootElement.querySelector("#book-content");
  const title = contentElement?.querySelector("h1")?.text;
  
  console.error(chalk.stderr.blue(title));

  output.content.title = title;
  
  const chapterNodeList = contentElement?.querySelector("#toc-top-ul");
  for (const chapterNode of chapterNodeList?.childNodes || []) {
    if (!(chapterNode instanceof HTMLElement)) continue;
    
    const chapterElement = chapterNode as HTMLElement;
    if (!chapterElement.tagName) continue;
    
    const chapterTitle = chapterElement.querySelector("a")?.text;
    if (!chapterTitle) continue;

    const chapterUrlRaw = chapterElement.querySelector("a")?.getAttribute("href");
    if (!chapterUrlRaw) continue;
    const chapterUrl = new URL(chapterUrlRaw, o.url).href;

    console.error(chalk.stderr.blueBright(`  ${chapterTitle} (${chapterUrl})`));

    const chapter: Chapter = {
      html: "",
      sections: [],
      title: chapterTitle,
    };
    output.content.chapters.push(chapter);

    const chapterResponse = await fetch(chapterUrl);
    const chapterHtml = await chapterResponse.text();
    const chapterRootElement = parse(chapterHtml);
    const chapterContentElement = chapterRootElement.querySelector("#book-content")?.querySelector("div");
    if (!chapterContentElement) continue;

    chapter.html = chapterContentElement.toString();

    const sectionNodeList = chapterElement.querySelector("ul");
    for (const sectionNode of sectionNodeList?.childNodes || []) {
      if (!(sectionNode instanceof HTMLElement)) continue;

      const sectionElement = sectionNode as HTMLElement;
      if (!sectionElement.tagName) continue;

      const sectionTitle = sectionElement.querySelector("a")?.text;
      if (!sectionTitle) continue;

      const sectionUrlRaw = sectionElement.querySelector("a")?.getAttribute("href");
      if (!sectionUrlRaw) continue;
      const sectionUrl = new URL(sectionUrlRaw, o.url).href;

      console.error(chalk.stderr.cyan(`    ${sectionTitle} (${sectionUrl})`));

      const section: Section = {
        html: "",
        title: sectionTitle,
      };
      chapter.sections.push(section);

      const sectionResponse = await fetch(sectionUrl);
      const sectionHtml = await sectionResponse.text();
      const sectionRootElement = parse(sectionHtml);
      const sectionContentElement = sectionRootElement.querySelector("#book-content")?.querySelector("div");
      if (!sectionContentElement) continue;

      section.html = chapterContentElement.toString();
    }
  }

  console.log(JSON.stringify(output, null, 2));
};

export { jsonify };