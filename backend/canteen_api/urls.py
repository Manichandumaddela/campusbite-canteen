from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.http import HttpResponse

def root_view(request):
    html = """
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>CampusBite — Backend API Running</title>
        <style>
            * { box-sizing: border-box; margin: 0; padding: 0; }
            body {
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
                background: #0f172a;
                color: #f8fafc;
                min-height: 100vh;
                display: flex;
                align-items: center;
                justify-content: center;
                padding: 24px;
            }
            .card {
                background: #1e293b;
                border: 1px solid #334155;
                border-radius: 16px;
                padding: 40px;
                max-width: 600px;
                width: 100%;
                box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
                text-align: center;
            }
            .badge {
                display: inline-flex;
                align-items: center;
                gap: 6px;
                background: rgba(34, 197, 94, 0.15);
                color: #4ade80;
                padding: 6px 14px;
                border-radius: 9999px;
                font-size: 13px;
                font-weight: 600;
                margin-bottom: 20px;
                border: 1px solid rgba(34, 197, 94, 0.3);
            }
            .badge::before {
                content: '';
                display: inline-block;
                width: 8px;
                height: 8px;
                border-radius: 50%;
                background: #22c55e;
                box-shadow: 0 0 10px #22c55e;
            }
            h1 { font-size: 26px; font-weight: 800; margin-bottom: 12px; color: #ffffff; }
            p { color: #94a3b8; font-size: 15px; line-height: 1.6; margin-bottom: 28px; }
            .btn-primary {
                display: inline-block;
                background: linear-gradient(135deg, #f97316 0%, #ea580c 100%);
                color: #ffffff;
                text-decoration: none;
                font-weight: 700;
                font-size: 16px;
                padding: 14px 28px;
                border-radius: 10px;
                box-shadow: 0 4px 14px rgba(249, 115, 22, 0.4);
                transition: transform 0.15s ease, box-shadow 0.15s ease;
                margin-bottom: 24px;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 20px rgba(249, 115, 22, 0.6);
            }
            .links {
                display: flex;
                justify-content: center;
                gap: 16px;
                flex-wrap: wrap;
                border-top: 1px solid #334155;
                padding-top: 20px;
            }
            .links a {
                color: #38bdf8;
                text-decoration: none;
                font-size: 14px;
                font-weight: 500;
            }
            .links a:hover {
                text-decoration: underline;
            }
            .note {
                margin-top: 16px;
                font-size: 12px;
                color: #64748b;
            }
        </style>
    </head>
    <body>
        <div class="card">
            <div class="badge">Django Backend API Active</div>
            <h1>CampusBite Canteen API</h1>
            <p>
                You have reached the <strong>Django REST API backend</strong> server (port 8000).<br>
                The frontend interactive web application is running on port <strong>5173</strong>.
            </p>
            <a href="http://localhost:5173" class="btn-primary">🚀 Open CampusBite Web App</a>
            <div class="links">
                <a href="/admin/">🔐 Django Admin</a>
                <a href="/api/foods/">🍔 Foods API</a>
                <a href="/api/categories/">📂 Categories API</a>
            </div>
            <p class="note">URL: http://localhost:8000/ &bull; Frontend: http://localhost:5173/</p>
        </div>
    </body>
    </html>
    """
    return HttpResponse(html)

urlpatterns = [
    path('', root_view, name='root'),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
] + static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

