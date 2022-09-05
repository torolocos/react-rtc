import React from 'react';
import NextDocument, { Html, Head, Main, NextScript } from 'next/document';
import { getCssText } from 'src/features/ui/theme';

export default class Document extends NextDocument {
  render() {
    return (
      <Html lang="en">
        <Head>
          <style
            id="stitches"
            dangerouslySetInnerHTML={{ __html: getCssText() }}
          />
          <link href="/fonts/index.css" type="text/css" rel="stylesheet" />
        </Head>
        <body>
          <div id="modal"></div>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}
