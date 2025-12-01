from utils.nodes.cores import Node
from typing import Self


class HTTPRequests(Node):
    def __init__(self, headers:dict=None, payload:dict=None, requires_auth:bool=False, timeout:int=30) -> None:
        self.__headers = headers if headers is not None else {}
        self.__payload = payload if payload is not None else {}
        self.requires_auth = requires_auth
        self.timeout = timeout

    def gets(self, what:str|int) -> dict:
        if what == "headers" or what == 0:
            return self.__headers
        elif what == "payload" or what == 1:
            return self.__payload

    def sets(self, what:str|int, kv:dict) -> Self: # You can use this to return Self without setting.
        if what == "headers" or what == 0:
            for k, v in kv.items():
                self.__headers[k] = v
        elif what == "payload" or what == 1:
            for k, v in kv.items():
                self.__payload[k] = v
        return self

    def clears(self, what:str|int) -> Self:
        if what == "headers" or what == 0:
            self.__headers = {}
        elif what == "payload" or what == 1:
            self.__payload = {}
        return self