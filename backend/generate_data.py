import pandas as pd
import random
from datetime import datetime, timedelta

def generate_invoices(num_rows=200):
    data = []
    
    for i in range(num_rows):
        client_id = random.randint(1, 20)
        amount = round(random.uniform(100000.0, 5000000.0), 0)
        
        # Random dates
        issue_date = datetime.now() - timedelta(days=random.randint(1, 365))
        due_date = issue_date + timedelta(days=60)
        
        data.append({
            'NumDoc': 10000 + i,
            'MovFe': issue_date.strftime('%d-%m-%Y'),
            'MovFv': due_date.strftime('%d-%m-%Y'),
            'Monto': amount,
            'Tipo': 'Proveedores',
            'Nombre': f'Empresa Ejemplo {client_id}',
            'Rut': f'76.543.{client_id:03d}-K',
            'Ciudad': 'Santiago',
            'Pais': 'CL',
            'Dirreccion': f'Av. Providencia {random.randint(100, 999)}',
            'Fono': '22334455',
            'EMail': f'contacto@empresa{client_id}.cl',
            'Cuenta de abono': str(random.randint(10000000, 99999999))
        })
        
    df = pd.DataFrame(data)
    df.to_excel('facturas_v2.xlsx', index=False)
    print(f"Generated {num_rows} invoices in facturas_v2.xlsx")

if __name__ == "__main__":
    generate_invoices()
