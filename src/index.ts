import { jsonify } from "./jsonify";
import { program } from "commander";

program
  .name("jsonify")
  .option("--url <URL>", "Course content URL. Must start with https://2012books.lardbucket.org/.")
  .description("CLI to download course content to JSON.");

program.parse();

const options = program.opts();

(async () => {
  await jsonify({
    url: options.url,
  });
})();