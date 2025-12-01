from utils.nodes.requests import HTTPRequests
from process.submit.loads import auth_payload, auth_headers
import requests


class RequestAuth(HTTPRequests):
    def __init__(self, user_name:str, user_pass:str, url:str, headers:dict=None, payload:dict=None, timeout:int=30) -> None:
        super().__init__(headers, payload, requires_auth=False, timeout=timeout)
        self.__set_userdata(user_name, user_pass) # Set user data here. Do not save user data outside of session.
        self.url = url

    def __call__(self, *args, **kwargs) -> requests.Session:
        return self.__get_auth()

    def get_session(self) -> requests.Session:
        return self.__get_auth()

    def __get_auth(self) -> requests.Session:
        try:
            session = requests.Session()
            response = session.post(self.url, data=self.gets("payload"), headers=self.gets("headers"), timeout=self.timeout)
        except requests.exceptions.RequestException as e:
            raise Exception(f"[RequestAuth] Login request Error: {e}")
        else:
            if response.status_code == 200:
                print("[InitAuth] Login Success !!")
                return session
            else:
                raise Exception(f"[RequestAuth] Login failed (code: {response.status_code}): {response.text}")
        finally:
            self.clears("headers")
            self.clears("payload")

    def __set_userdata(self, user_name:str, user_pass:str) -> None:
        # If login headers or payload keys are changed, just change here only. (+ auth_headers, auth_payload)
        headers = self.gets("headers")
        payload = self.gets("payload")

        if headers is None:
            headers = headers if headers is not None else auth_headers
        if payload is None:
            payload = payload if payload is not None else auth_payload

        payload["dma_param"]["elpUserId"] = user_name
        payload["dma_param"]["elpUserPwd"] = user_pass
        payload["dma_param"]["clientTime"] = 0 # 이거 뭐냐고

        self.sets("headers", headers)
        self.sets("payload", payload)


class RequestSubmit(HTTPRequests): # 테스크에 맞는 요청 발송
    def __call__(self, *args, **kwargs):
        pass

    def request(self, url:str):
        try:
            response = self.__session.post(url, data={}, headers={}, timeout=self.timeout)
        except requests.exceptions.RequestException as e:
            print(f"[RequestHTTP] Error: {e}")
            # ErrorBags.submit.append()