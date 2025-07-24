# backend/main.py


from fastapi import FastAPI

app = FastAPI()

@app.get("/")
def read_root():
    return {"message": "Gipoly backend API is live!"}