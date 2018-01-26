from django.conf.urls import url, include
from django.contrib import admin
from django.contrib.auth.views import login, logout
from chat.views import index,home,create_room, create_group, submitGroupCode, create_open_group, login_page
from django.conf import settings
from django.conf.urls.static import static
from . import views


urlpatterns = [
    #url(r'^$', views.loge,name='loge'),
    url(r'^$',login_page),
    url(r'^home/$', home),
    url(r'^accounts/', include('allauth.urls')),
    url(r'^accounts/login/$', login,{'template_name':'psych/login.html'}),
    url(r'^accounts/logout/$', logout),
    url(r'^admin/', admin.site.urls),
    url(r'^create_room/$', create_room),
    url(r'^create_group/$', create_group),
    url(r'^submitGroupCode/$', submitGroupCode),
    url(r'^create_open_group/$', create_open_group)

]


urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)