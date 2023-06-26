import threading
import openai

import spacetimedb_python_sdk.local_config as local_config
import json

max_openai_calls_retries = 3
openai_calls_retried = 0

initialized = False

def openai_call(
    prompt: str,
    model: str = None,
    temperature: float = 0.5,
    max_tokens: int = 2500,
):
    #prompt_json = {"name": "World Name", "description": prompt}
    #return json.dumps(prompt_json)
    print("OPENAI PROMPT: " + prompt + "\n\n")

    global initialized    
    if not initialized:
        openai.api_key = local_config.get_string("openapi_key")        
        initialized = True

    if not model:
        model = local_config.get_string("openapi_model")
    if not model:
        model = "gpt-3.5-turbo"
    global openai_calls_retried
    if not model.startswith("gpt-"):
        # Use completion API
        response = openai.Completion.create(
            engine=model,
            prompt=prompt,
            temperature=temperature,
            max_tokens=max_tokens,
            top_p=1,
            frequency_penalty=0,
            presence_penalty=0
        )
        return response.choices[0].text.strip()
    else:
        # Use chat completion API
        messages=[{"role": "user", "content": prompt}]
        try:
            response = openai.ChatCompletion.create(
                model=model,
                messages=messages,
                temperature=temperature,
                max_tokens=max_tokens,
                n=1,
                stop=None,
            )
            openai_calls_retried = 0
            result = response.choices[0].message.content.strip()
            print("OPENAI RESULT: " + result + "\n\n")
            return result
        except Exception as e:
            # try again
            print(e)
            if openai_calls_retried < max_openai_calls_retries:
                openai_calls_retried += 1
                print(f"Error calling OpenAI. Retrying {openai_calls_retried} of {max_openai_calls_retries}...")
                return openai_call(prompt, model, temperature, max_tokens)

# This is a base class that represents a task that runs on a thread.  It checks the precondition, calls openai with the prompt, calls the validate on the response, and then calls process response. It calls a user provided callback in either failure or success.
class OpenAIWorkerTask(threading.Thread):
    def __init__(self, callback, response_format, task_name):
        super().__init__()
        self.callback = callback
        self.response_format = response_format
        self.task_name = task_name
        
    def precondition(self):
        # Implement in subclass (Optional)
        return True
    
    def prompt(self):
        # Implement in subclass (Required)
        raise NotImplementedError
    
    def validate(self, response):
        # Implement in subclass (Optional)
        return True
        
    def process_response(self, response):
        # Implement in subclass (Required)
        raise NotImplementedError

    def run(self):
        if self.precondition():
            prompt = self.prompt()
            for attempt in range(3):
                try:
                    response = openai_call(prompt)
                    response_json = json.loads(response)
                    break
                except Exception as e:
                    print(e)
                    if attempt == 2:
                        print(f"Error in task {self.task_name}. Giving up...")
                        print(f"Prompt: {prompt}")
                        self.callback("failure")
                    else:
                        print(f"Error in task {self.task_name}. Retrying...")
            if self.validate(response_json):
                self.process_response(response_json)
                self.callback("success")
            else:
                self.callback("invalid")
        else:
            self.callback("precondition")
    
