from fastapi import FastAPI, Request, Query
from fastapi.responses import HTMLResponse
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from typing import Optional
from data import MACHINES, CATEGORIES

app = FastAPI(
    title="TDM — Tudo de Madeira e Móveis",
    description="Catálogo de maquinaria para carpintería industrial",
    version="2.0.0",
)

app.mount("/static", StaticFiles(directory="static"), name="static")
templates = Jinja2Templates(directory="templates")

# ── Página principal ──────────────────────────────────────────────────
@app.get("/", response_class=HTMLResponse)
async def index(request: Request):
    return templates.TemplateResponse(
        request=request,
        name="index.html",
        context={"categories": CATEGORIES},
    )

# ── Página de detalhe da máquina ──────────────────────────────────────
@app.get("/machine/{machine_id}", response_class=HTMLResponse)
async def machine_detail(request: Request, machine_id: int):
    from fastapi import HTTPException
    machine = next((m for m in MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    return templates.TemplateResponse(
        request=request,
        name="machine.html",
        context={"machine": machine},
    )

# ── API REST ──────────────────────────────────────────────────────────
@app.get("/api/machines")
async def get_machines(
    category: Optional[str] = Query(None),
    q: Optional[str] = Query(None),
):
    result = MACHINES
    if category and category != "all":
        result = [m for m in result if m["category"] == category]
    if q:
        q_lower = q.lower()
        result = [
            m for m in result
            if q_lower in m["name"].lower() or q_lower in m["generic"].lower()
        ]
    return {"total": len(result), "machines": result}

@app.get("/api/machines/{machine_id}")
async def get_machine(machine_id: int):
    from fastapi import HTTPException
    machine = next((m for m in MACHINES if m["id"] == machine_id), None)
    if not machine:
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    return machine

@app.get("/api/categories")
async def get_categories():
    return CATEGORIES

@app.get("/api/whatsapp/{machine_id}")
async def whatsapp_link(machine_id: int, phone: str = "5916775803"):
    import urllib.parse
    machine = next((m for m in MACHINES if m["id"] == machine_id), None)
    if not machine:
        from fastapi import HTTPException
        raise HTTPException(status_code=404, detail="Máquina no encontrada")
    msg = f"Hola, me interesa la máquina: *{machine['name']}* ({machine['generic']}). ¿Podría brindarme más información y precio?"
    encoded = urllib.parse.quote(msg)
    return {"url": f"https://wa.me/{phone}?text={encoded}"}
