import { useEffect, useRef, useState } from "react";
import WebViewer from "@pdftron/webviewer";

export default function PDFViewerComponent(props) {
  // TODO::declare and define component state and variables
  let { url } = props;
  const viewer = useRef(null);
  let webViewerInstanceCreated = true;
  let imageName = "/assets/asd.jpg";
  let fileName = url;

  // ** hindle side effects
  useEffect(() => {
    /*use webViewerInstance to prevent call weViewer more than one time */
    if (webViewerInstanceCreated == true) {
      webViewerInstanceCreated = false;

      WebViewer(
        {
          path: "/lib",
          licenseKey:
            "demo:1724832999507:7e5db65a030000000066a5a7954aff7d9882d3a9cd2b3542f4a7b1caa2",
          initialDoc: url,
          fullAPI: true,
        },
        viewer.current
      ).then(async (instance) => {
        const { documentViewer, annotationManager, PDFNet } = instance.Core;
        // you can now call WebViewer APIs here...
        /**
         * When Document Loaded we can do alot of things
         * add annotation
         */
        documentViewer.addEventListener("documentLoaded", () => {
          //get first document or you can get specific page
          const doc = documentViewer.getDocument();
          // we can rotate document with specific angle
          //   doc.rotatePages([1], instance.Core.PageRotation.E_270);
          // to get documentations count
          const pageCount = documentViewer.getPageCount();
          console.log("DocumentationsX Count :: ", pageCount);
          // to get current page number
          const currentPageNum = documentViewer.getCurrentPage(); // 1-indexed
          console.log("DocumentationsX currentPageNum :: ", currentPageNum);
          // we can set current page
          documentViewer.setCurrentPage(3); // Goes to page 3 of the document

          // saving document
          instance.UI.setHeaderItems((header) => {
            header.push({
              type: "actionButton",
              img: "...",
              onClick: async () => {
                const doc = documentViewer.getDocument();
                const xfdfString = await annotationManager.exportAnnotations();
                const data = await doc.getFileData({
                  // saves the document with annotations in it
                  xfdfString,
                });
                const arr = new Uint8Array(data);
                const blob = new Blob([arr], { type: "application/pdf" });
                // download file
                const options = {
                  filename: "myDocument.pdf",
                  xfdfString,
                  flags: instance.Core.SaveOptions.LINEARIZED,
                  downloadType: "pdf",
                };
                instance.UI.downloadPdf(options);

                // Add code for handling Blob here
              },
            });
          });

          // add watermark
          documentViewer.setWatermark({
            // Draw diagonal watermark in middle of the document
            diagonal: {
              fontSize: 25, // or even smaller size
              fontFamily: "sans-serif",
              color: "red",
              opacity: 50, // from 0 to 100
              text: "Watermark",
            },
          });
          //
        });

        /**
         * When user change page
         */
        documentViewer.addEventListener("pageNumberUpdated", (pageNumber) => {
          console.log(
            "User Change Page and move to page number ::",
            pageNumber
          );
        });
        /**
         * Start Add Image Programmatically
         */
        async function addImage() {
          await PDFNet.initialize();
          const doc = await documentViewer.getDocument().getPDFDoc();

          // Run PDFNet methods with memory management
          await PDFNet.runWithCleanup(async () => {
            // lock the document before a write operation
            // runWithCleanup will auto unlock when complete
            doc.lock();
            const s = await PDFNet.Stamper.create(
              PDFNet.Stamper.SizeType.e_absolute_size,
              200,
              100
            );

            const img = await PDFNet.Image.createFromURL(doc, imageName);
            s.setAsBackground(true);
            const pgSetImage = await PDFNet.PageSet.createRange(1, 1);
            await s.setAlignment(
              PDFNet.Stamper.HorizontalAlignment.e_horizontal_right,
              PDFNet.Stamper.VerticalAlignment.e_vertical_bottom
            );
            // Set the position offset (e.g., bottom margin of 50 points)
            const horizontalOffset = 50; // No horizontal margin
            const verticalOffset = 50; // 50 points bottom margin
            await s.setPosition(horizontalOffset, verticalOffset);

            await s.stampImage(doc, img, pgSetImage);
          });

          // clear the cache (rendered) data with the newly updated document
          documentViewer.refreshAll();

          // Update viewer to render with the new document
          documentViewer.updateView();

          // Refresh searchable and selectable text data with the new document
          documentViewer.getDocument().refreshTextData();
        }
        await addImage();
      });
    }

    // Cleanup on component unmount
    return () => {};
  }, [url]);

  return (
    <>
      <button id="mybtn">My Button</button>
      <div
        className="webviewer"
        ref={viewer}
        style={{ height: "100vh", width: "100%" }}
      ></div>
    </>
  );
}
