from utils.info import _doc_type_id

prompt = """
You are a highly skilled information extraction bot.
Your task is to extract specific fields of information from the provided document files to be submitted to legal and administrative agencies.

Return only the JSON object. Do not include any other text.

Example return of JSON format:
{{
    "document_types": ["상고이유서", ""],
    "extracted_data": {
        "case_number": "123가소4567",
        "court_name": "서울중앙지방법원",
        "party_name": "홍길동"
    }
}}
"""

request_description = {
    "type": "object",
    "properties": {
        "document_types": {
            "type": "array",
            "description": "List of the categories of provided documents.",
            "items": {
                "type": "string",
                "description": "Identify the category of each document.",
                "enum": _doc_type_id.keys()
            }
        },
        "extracted_data": {
            "type": "object",
            "description": "Extract and populate the fields required by document_types. Omit the non-relevant items or leave them as null.",
            "properties": {
                "party_name": {"type": "string", "description": "당사자 이름", "required_by": ["A", "B"]},
                "court_name": {"type": "string", "description": "처리 법원명", "required_by": ["A"]},
                "case_number": {"type": "string", "description": "사건 번호", "required_by": ["B", "C", "D"]},
                "party_id_number": {"type": "string", "description": "당사자 주민등록번호", "required_by": ["B", "E", "F"]},
                "processing_datetime": {"type": "string", "description": "처리 일시 (YYYY-MM-DD HH:MM 형태)", "required_by": ["A", "C"]},
                "claim_amount": {"type": "number", "description": "청구 금액 (숫자만)", "required_by": ["B", "D"]}
          }
        }
      },
      "required": ["document_types", "extracted_data"]
}