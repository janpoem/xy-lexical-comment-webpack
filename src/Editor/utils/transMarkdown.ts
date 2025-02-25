import {
  $convertFromMarkdownString,
  $convertToMarkdownString,
  TRANSFORMERS,
} from '@lexical/markdown';

export const transMarkdown = (mdContent: string) => {
  $convertFromMarkdownString(mdContent, TRANSFORMERS);
}
