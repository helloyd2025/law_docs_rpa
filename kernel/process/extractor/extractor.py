from utils.nodes.cores import Node
from utils.info import _doc_type_id
from google import genai

import json, traceback
from typing import Callable
import inspect


class LMExtractor(Node):
    def __init__(self, prompt:str, form_description:dict, model:str, api_key:str=None) -> None:
        """
        Args:
            prompt (str): detailed instructions.
            form_description (dict): specify fields to extract, and describe fields with "type" and "description" keys.
            model (str): model name with explicit version and type.
            api_key (str): API key. If not required, pass None.
        """
        self.prompt = prompt
        self.form_description = form_description
        self.model = model.lower()
        self.__model = self.__route_model(self.model)
        self.__api_key = api_key


    def __route_model(self, model:str) -> Callable:
        mangled_meth_prefix = f"_{self.__class__.__name__}__ask_"
        for name, meth in inspect.getmembers(self, predicate=inspect.ismethod):
            if name.startswith(mangled_meth_prefix):
                model_basename = name[len(mangled_meth_prefix):]
                if model.startswith(model_basename):
                    return meth # Assuming no duplicates in any model names. (excludes like jin and jinja)
        raise ValueError(f"Invalid model name: {model}.")


    def __call__(self, file_paths:list[str], *args, **kwargs) -> tuple[list[int], dict]:
        return self.forward(file_paths)


    def forward(self, file_paths:list[str]) -> tuple[list[int], dict]:
        """
        Extract data based on the provided document files on paths.

        Args:
            file_paths (list[str]): exact full file paths on working server.
        Returns:
            doc_ids (list[int]): corresponding ids of document types.
            data (dict): extracted data from all provided documents in JSON format. (error keys: error_files, error_message)
        """
        doc_ids = None
        data = None

        try:
            print(f"[DocsConverter - {self.model}] Analyzing {len(file_paths)} docs...")
            doc_types, data = self.__model(file_paths)
            doc_ids = self.__validate_data(doc_types, expected_len=len(file_paths))
        except Exception as e:
            print(f"[DocsConverter - {self.model}] Error: {e}")
            return None, {"error_files": file_paths, "error_message": traceback.format_exc()}
        else:
            print("[DocsConverter] Success !!")
            return doc_ids, data


    def __validate_data(self, doc_types:list[str], expected_len:int) -> list[int]:
        # Lenght check
        if len(doc_ids) != expected_len:
            raise Exception(f"[DocsConverter - {self.model}] # of input and output docs is different...")

        # Convert types to ids
        doc_ids = []
        for doc_type in doc_types:
            doc_id = _doc_type_id.get(doc_type, -1)
            if doc_id == -1:
                raise Exception(f"[DocsConverter - {self.model}] Model got invalid doc types: {doc_types}")
            else:
                doc_ids.append(doc_id)

        return doc_ids


    # ==== Model calling methods below. (recommended to keep models to three or less, after test) ====
    # ==== Every model calling method name must be f"__ask_{model_basename}". ====
    def __ask_gemini(self, file_paths:list[str]) -> tuple[list[str], dict]:
        # The client gets the api_key from the environment variable `GEMINI_API_KEY` if api_key is null.
        client = genai.Client(api_key=self.__api_key)
        files_upload = []

        for file_path in file_paths:
            a_file = client.files.upload(file=file_path)
            files_upload.append(a_file)

        contents = [self.prompt, self.form_description] + files_upload
        response = client.models.generate_content(model=self.model, contents=contents)
        response = json.loads(response.text.replace("```json", "").replace("```", "").strip())

        return response.get("document_types", []), response.get("extracted_data", {})


    def __ask_qwen(self, file_paths:list[str]) -> tuple[list[str], dict]:
        pass

    def __ask_llama(self, file_paths:list[str]) -> tuple[list[str], dict]:
        pass

    def __ask_deepseek(self, file_path:list[str]) -> tuple[list[str], dict]:
        pass