import { Processor, Plugin } from 'postcss';

type Options = {
  selector?: (selector: string) => boolean | string | RegExp;
  preserveEmpty?: boolean;
};

declare const postcss: true;
declare function pluginCreator(options?: Options): Plugin | Processor;
declare namespace pluginCreator {
  export { postcss, Options };
}

export = pluginCreator;
