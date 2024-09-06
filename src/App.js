import logo from "./logo.svg";
import "./App.css";
import PDFViewerComponent from "./components/PDFViewerComponent";

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Deal with PDFs in PDFTron</h1>
        <PDFViewerComponent url="https://pdftron.s3.amazonaws.com/downloads/pl/demo-annotated.pdf" />
      </header>
    </div>
  );
}

export default App;
