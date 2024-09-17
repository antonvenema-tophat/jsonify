import chalk from "chalk";
import { parse, HTMLElement } from 'node-html-parser';

interface Output {
  content: Textbook;
}

interface Textbook {
  for: string;
  title?: string;
  chapters: Chapter[];
}

interface Chapter {
  title: string;
  elements: Element[];
  sections: Section[];
}

interface Section {
  title: string;
  elements: Element[];
}

interface Element {
  type: string;
  text: string;
}

const jsonify = async (o: Options) => {
  const output: Output = {
    content: {
      for: "lecture",
      chapters: [],
    }
  };

  console.log(chalk.green(`Fetching ${o.url}...`));
  const response = await fetch(o.url);
  const html = await response.text();
  
  console.log(chalk.green(`Parsing HTML...`));
  const root = parse(html);
  const content = root.querySelector("#book-content");
  const title = content?.querySelector("h1")?.text;
  
  console.log(chalk.blue(title));
  output.content.title = title;
  
  const chapters = content?.querySelector("#toc-top-ul");
  for (const chapterNode of chapters?.childNodes || []) {
    if (!(chapterNode instanceof HTMLElement)) continue;
    
    const chapter = chapterNode as HTMLElement;
    if (!chapter.tagName) continue;
    
    const chapterTitle = chapter.querySelector("a")?.text;
    if (!chapterTitle) continue;

    const chapterUrl = chapter.querySelector("a")?.getAttribute("href");

    console.log(chalk.blueBright(`  ${chapterTitle} (${chapterUrl})`));

    const sections = chapter.querySelector("ul");
    for (const sectionNode of sections?.childNodes || []) {
      if (!(sectionNode instanceof HTMLElement)) continue;

      const section = sectionNode as HTMLElement;
      if (!section.tagName) continue;

      const sectionTitle = section.querySelector("a")?.text;
      if (!sectionTitle) continue;

      const sectionUrl = section.querySelector("a")?.getAttribute("href");

      console.log(chalk.cyan(`    ${sectionTitle} (${sectionUrl})`));
    }
  }
};

export { jsonify };