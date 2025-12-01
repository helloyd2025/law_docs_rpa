from utils.nodes.cores import Node

import PyPDF2
from docx import Document
from pathlib import Path


class DocumentParser(Node):
    def __call__(self, file_path:str, *args, **kwargs) -> str:
        return self.extract_text_from_file(file_path)

    def extract_text_from_file(self, file_path:str) -> str:
        """
        지원하는 모든 문서 형식에서 순수 텍스트를 추출
        """
        ext = Path(file_path).suffix.lower()
        if ext == ".pdf":
            return self._read_pdf(file_path)
        elif ext == ".docx":
            return self._read_docx(file_path)
        elif ext in {".txt", ".md"}:
            return self._read_text_file(file_path)
        else:
            raise ValueError(f"지원하지 않는 파일 형식: {ext}")

    def _read_pdf(self, path:str) -> str:
        text = []
        with open(path, "rb") as f:
            reader = PyPDF2.PdfReader(f)
            for page in reader.pages:
                text.append(page.extract_text() or "")
        return "\n".join(text)

    def _read_docx(self, path:str) -> str:
        doc = Document(path)
        return "\n".join([para.text for para in doc.paragraphs])

    def _read_text_file(self, path:str) -> str:
        # txt, hwp는 별도 처리 필요하면 추가
        with open(path, "r", encoding="utf-8") as f:
            return f.read()