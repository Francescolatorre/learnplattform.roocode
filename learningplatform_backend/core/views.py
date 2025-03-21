from django.http import JsonResponse

def api_endpoint(request):
    return JsonResponse({'message': 'API endpoint is working!'})
