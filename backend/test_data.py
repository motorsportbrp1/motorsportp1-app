import os
from supabase import create_client, Client
from dotenv import load_dotenv

def init_supabase() -> Client:
    load_dotenv()
    url: str = os.getenv("SUPABASE_URL")
    key: str = os.getenv("SUPABASE_KEY")
    if not url or not key:
        print("❌ ERRO: SUPABASE_URL ou SUPABASE_KEY não encontrados.")
        exit(1)
    return create_client(url, key)

def run_tests(supabase: Client):
    print("🧪 Iniciando Verificação de Integridade dos Dados da F1...\n")

    # Teste 1: Total de Pilotos (Deve ser maior que 800)
    drivers = supabase.table("drivers").select("*", count="exact").limit(1).execute()
    total_drivers = drivers.count
    print(f"🏁 Teste 1 (Total de Pilotos): {total_drivers}")
    if total_drivers and total_drivers > 800:
        print("   ✅ Aprovado!")
    else:
        print("   ❌ Reprovado! (Base de dados não parece estar completa)")

    # Teste 2: Buscar Ayrton Senna
    senna = supabase.table("drivers").select("firstname", "lastname").eq("id", "ayrton-senna").execute()
    print(f"\n🇧🇷 Teste 2 (Verificar Ayrton Senna): {senna.data}")
    if senna.data and len(senna.data) > 0:
        print("   ✅ Aprovado!")
    else:
        print("   ❌ Reprovado! (Senna não encontrado na tabela drivers)")

    # Teste 3: Final da Temporada de 2021 (Abu Dhabi)
    print("\n🏁 Teste 3 (Abu Dhabi 2021 - Quem venceu?)")
    try:
        # Encontra a corrida de 2021 em Abu Dhabi (Usando schema do F1DB)
        race = supabase.table("races").select("id", "officialname").eq("year", 2021).eq("grandprixid", "abu-dhabi").execute()
        
        if race.data and len(race.data) > 0:
            race_id = race.data[0]["id"]
            
            # Pega o vencedor
            winner = supabase.table("results").select("driverid, positionnumber").eq("raceid", race_id).eq("positionnumber", 1).execute()
            
            if winner.data and len(winner.data) > 0:
                driver_id = winner.data[0]["driverid"]
                driver_info = supabase.table("drivers").select("firstname", "lastname").eq("id", driver_id).execute()
                
                name = f"{driver_info.data[0]['firstname']} {driver_info.data[0]['lastname']}"
                print(f"   🏆 Vencedor encontrado: {name}")
                if "Max" in name and "Verstappen" in name:
                    print("   ✅ Aprovado! (Max Verstappen venceu a final de 2021)")
                else:
                    print("   ❌ Reprovado! (O vencedor não foi reconhecido como Max Verstappen)")
            else:
                print("   ❌ Reprovado! (Resultados da corrida não encontrados)")
        else:
            print("   ❌ Reprovado! (Corrida Abu Dhabi 2021 não encontrada)")
            
    except Exception as e:
        print(f"   ❌ Erro ao realizar a busca relacional: {e}")

if __name__ == "__main__":
    supabase = init_supabase()
    run_tests(supabase)
