-- =====================================================================
-- DADOS DE EXEMPLO · Gestão de Frota — rode DEPOIS do schema.sql. Pode rodar de novo.
-- Datas relativas: o painel sempre aparece com movimento, seja qual for o dia.
-- Para o cliente real, NÃO rode este arquivo.
-- =====================================================================
do $seed$
begin
  perform set_config('app.carga_exemplo', 'on', true);

  -- limpa só os exemplos (ids fixos) e recria
  delete from public.multas where id::text like '00000000-0000-0000-0007-%';
  delete from public.despesas where id::text like '00000000-0000-0000-0006-%';
  delete from public.manutencoes where id::text like '00000000-0000-0000-0005-%';
  delete from public.abastecimentos where id::text like '00000000-0000-0000-0004-%';
  delete from public.viagens where id::text like '00000000-0000-0000-0003-%';
  delete from public.veiculos where id::text like '00000000-0000-0000-0002-%';
  delete from public.motoristas where id::text like '00000000-0000-0000-0001-%';

  insert into public.configuracoes
    (unica, nome_negocio, whatsapp, cidade, endereco, instagram, cor_primaria, cor_destaque, mensagem_whatsapp)
  values
    (true, 'Transportes Vale do Sol', '5516900000000', 'Ribeirão Preto - SP', 'Av. Presidente Vargas, 2100 - Distrito Industrial', 'transportesvaledosol', '#2F3640', '#E1B12C',
     'Olá, {nome}! Aqui é da Transportes Vale do Sol.')
  on conflict (unica) do update set
    nome_negocio = excluded.nome_negocio, whatsapp = excluded.whatsapp, cidade = excluded.cidade,
    endereco = excluded.endereco, instagram = excluded.instagram, cor_primaria = excluded.cor_primaria,
    cor_destaque = excluded.cor_destaque, mensagem_whatsapp = excluded.mensagem_whatsapp;

  -- Motoristas
  insert into public.motoristas (id, nome, telefone, cnh_categoria, cnh_validade, status, observacoes) values
    ('00000000-0000-0000-0001-000000000001', 'Anderson Lopes', '11991759955', 'B', ((now() at time zone 'America/Sao_Paulo')::date + 40), 'ativo', null),
    ('00000000-0000-0000-0001-000000000002', 'Bruno Tavares', '11986102164', 'C', ((now() at time zone 'America/Sao_Paulo')::date + 400), 'ativo', null),
    ('00000000-0000-0000-0001-000000000003', 'Cláudio Mendes', '11993534056', 'D', ((now() at time zone 'America/Sao_Paulo')::date + 12), 'ativo', null),
    ('00000000-0000-0000-0001-000000000004', 'Dirceu Almeida', '11979301907', 'E', ((now() at time zone 'America/Sao_Paulo')::date + 800), 'ativo', null),
    ('00000000-0000-0000-0001-000000000005', 'Edson Barbosa', '11979595756', 'AB', ((now() at time zone 'America/Sao_Paulo')::date + -20), 'ativo', null),
    ('00000000-0000-0000-0001-000000000006', 'Fábio Nogueira', '11976590194', 'B', ((now() at time zone 'America/Sao_Paulo')::date + 150), 'ativo', null),
    ('00000000-0000-0000-0001-000000000007', 'Genivaldo Rocha', '11972481317', 'C', ((now() at time zone 'America/Sao_Paulo')::date + 600), 'afastado', null),
    ('00000000-0000-0000-0001-000000000008', 'Heitor Campos', '11972193427', 'D', ((now() at time zone 'America/Sao_Paulo')::date + 300), 'ativo', null);

  -- Veículos
  insert into public.veiculos (id, placa, modelo, marca, tipo, ano, combustivel, odometro, motorista_id, status, crlv_vencimento, ipva_vencimento, seguro_vencimento, observacoes) values
    ('00000000-0000-0000-0002-000000000001', 'QWE4R56', 'Hilux CD SRV', 'Toyota', 'utilitario', 2022, 'diesel', 48200, '00000000-0000-0000-0001-000000000001', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 20), ((now() at time zone 'America/Sao_Paulo')::date + 75), ((now() at time zone 'America/Sao_Paulo')::date + 100), null),
    ('00000000-0000-0000-0002-000000000002', 'RTY7U89', 'Strada Endurance', 'Fiat', 'utilitario', 2023, 'flex', 31500, '00000000-0000-0000-0001-000000000002', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 95), ((now() at time zone 'America/Sao_Paulo')::date + 18), ((now() at time zone 'America/Sao_Paulo')::date + 30), null),
    ('00000000-0000-0000-0002-000000000003', 'UIO1P23', 'Sprinter 415', 'Mercedes-Benz', 'van', 2021, 'diesel', 96800, '00000000-0000-0000-0001-000000000003', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + -12), ((now() at time zone 'America/Sao_Paulo')::date + 140), ((now() at time zone 'America/Sao_Paulo')::date + 210), null),
    ('00000000-0000-0000-0002-000000000004', 'ASD5F67', 'Delivery Express', 'Volkswagen', 'caminhao', 2020, 'diesel', 154300, '00000000-0000-0000-0001-000000000004', 'manutencao', ((now() at time zone 'America/Sao_Paulo')::date + 60), ((now() at time zone 'America/Sao_Paulo')::date + 35), ((now() at time zone 'America/Sao_Paulo')::date + 4), null),
    ('00000000-0000-0000-0002-000000000005', 'GHJ8K12', 'Onix LT', 'Chevrolet', 'carro', 2022, 'flex', 42100, '00000000-0000-0000-0001-000000000005', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 200), ((now() at time zone 'America/Sao_Paulo')::date + 260), ((now() at time zone 'America/Sao_Paulo')::date + 180), null),
    ('00000000-0000-0000-0002-000000000006', 'ZXC3V45', 'Master Furgão', 'Renault', 'van', 2021, 'diesel', 88700, '00000000-0000-0000-0001-000000000006', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 8), ((now() at time zone 'America/Sao_Paulo')::date + 90), ((now() at time zone 'America/Sao_Paulo')::date + 70), null),
    ('00000000-0000-0000-0002-000000000007', 'BNM6L78', 'Fiorino Hard Working', 'Fiat', 'utilitario', 2019, 'flex', 121000, '00000000-0000-0000-0001-000000000001', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 130), ((now() at time zone 'America/Sao_Paulo')::date + 5), ((now() at time zone 'America/Sao_Paulo')::date + -6), null),
    ('00000000-0000-0000-0002-000000000008', 'POI9U12', 'Accelo 1016', 'Mercedes-Benz', 'caminhao', 2018, 'diesel', 203400, '00000000-0000-0000-0001-000000000002', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 45), ((now() at time zone 'America/Sao_Paulo')::date + 160), ((now() at time zone 'America/Sao_Paulo')::date + 120), null),
    ('00000000-0000-0000-0002-000000000009', 'LKJ2H34', 'Saveiro Robust', 'Volkswagen', 'utilitario', 2020, 'flex', 76900, null, 'reserva', ((now() at time zone 'America/Sao_Paulo')::date + 300), ((now() at time zone 'America/Sao_Paulo')::date + 310), ((now() at time zone 'America/Sao_Paulo')::date + 330), null),
    ('00000000-0000-0000-0002-000000000010', 'MNB5V67', 'Argo Drive', 'Fiat', 'carro', 2023, 'flex', 18400, '00000000-0000-0000-0001-000000000004', 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 220), ((now() at time zone 'America/Sao_Paulo')::date + 240), ((now() at time zone 'America/Sao_Paulo')::date + 260), null),
    ('00000000-0000-0000-0002-000000000011', 'CXZ8A90', 'CG 160 Start', 'Honda', 'moto', 2022, 'gasolina', 24700, null, 'ativo', ((now() at time zone 'America/Sao_Paulo')::date + 25), ((now() at time zone 'America/Sao_Paulo')::date + 55), ((now() at time zone 'America/Sao_Paulo')::date + 85), null),
    ('00000000-0000-0000-0002-000000000012', 'VFR1T23', 'Kangoo Express', 'Renault', 'van', 2017, 'flex', 167000, null, 'vendido', ((now() at time zone 'America/Sao_Paulo')::date + -400), ((now() at time zone 'America/Sao_Paulo')::date + -380), ((now() at time zone 'America/Sao_Paulo')::date + -390), null);

  -- Viagens e rotas
  insert into public.viagens (id, veiculo_id, motorista_id, data, origem, destino, finalidade, km_saida, km_chegada, status) values
    ('00000000-0000-0000-0003-000000000001', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -3), 'Matriz', 'Campinas - SP', 'Entrega de equipamentos', 47300, 48180, 'concluida'),
    ('00000000-0000-0000-0003-000000000002', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -2), 'Matriz', 'Araraquara - SP', 'Visita ao cliente', 30600, 30810, 'concluida'),
    ('00000000-0000-0000-0003-000000000003', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -6), 'Matriz', 'Belo Horizonte - MG', 'Carga fracionada', 95900, 97350, 'concluida'),
    ('00000000-0000-0000-0003-000000000004', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -1), 'Matriz', 'Franca - SP', 'Reunião comercial', 41200, 41375, 'concluida'),
    ('00000000-0000-0000-0003-000000000005', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -5), 'Matriz', 'São José do Rio Preto - SP', 'Entrega expressa', 87800, 88190, 'concluida'),
    ('00000000-0000-0000-0003-000000000006', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -4), 'Matriz', 'Uberlândia - MG', 'Carga seca', 202500, 203040, 'concluida'),
    ('00000000-0000-0000-0003-000000000007', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + 0), 'Matriz', 'Sertãozinho - SP', 'Entrega agendada', 47300, null, 'andamento'),
    ('00000000-0000-0000-0003-000000000008', '00000000-0000-0000-0002-000000000010', '00000000-0000-0000-0001-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + 0), 'Matriz', 'Bebedouro - SP', 'Visita técnica', 17500, null, 'andamento'),
    ('00000000-0000-0000-0003-000000000009', '00000000-0000-0000-0002-000000000007', '00000000-0000-0000-0001-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -9), 'Matriz', 'Pirassununga - SP', 'Entrega de peças', 120100, 120260, 'concluida'),
    ('00000000-0000-0000-0003-000000000010', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -12), 'Matriz', 'Goiânia - GO', 'Carga fracionada', 95900, 97020, 'concluida');

  -- Abastecimentos
  insert into public.abastecimentos (id, veiculo_id, data, motorista_id, litros, valor, odometro, posto) values
    ('00000000-0000-0000-0004-000000000001', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -2), '00000000-0000-0000-0001-000000000001', 105.9, 650.23, 48105, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000002', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -12), '00000000-0000-0000-0001-000000000001', 59.8, 365.38, 47402, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000003', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -27), '00000000-0000-0000-0001-000000000001', 46.3, 294.0, 46442, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000004', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -38), '00000000-0000-0000-0001-000000000001', 44.2, 273.6, 45771, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000005', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -49), '00000000-0000-0000-0001-000000000001', 78.3, 475.28, 44994, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000006', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -60), '00000000-0000-0000-0001-000000000001', 58.2, 368.99, 44264, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000007', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -69), '00000000-0000-0000-0001-000000000001', 100.2, 638.27, 43511, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000008', '00000000-0000-0000-0002-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -77), '00000000-0000-0000-0001-000000000001', 53.6, 337.14, 42673, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000009', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + 0), '00000000-0000-0000-0001-000000000002', 53.8, 328.18, 31497, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000010', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -12), '00000000-0000-0000-0001-000000000002', 67.7, 402.14, 30614, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000011', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -24), '00000000-0000-0000-0001-000000000002', 119.7, 725.38, 29821, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000012', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -33), '00000000-0000-0000-0001-000000000002', 68.9, 414.78, 29115, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000013', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -46), '00000000-0000-0000-0001-000000000002', 110.3, 632.02, 28317, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000014', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -56), '00000000-0000-0000-0001-000000000002', 101.2, 598.09, 27577, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000015', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -68), '00000000-0000-0000-0001-000000000002', 101.1, 593.46, 26658, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000016', '00000000-0000-0000-0002-000000000002', ((now() at time zone 'America/Sao_Paulo')::date + -79), '00000000-0000-0000-0001-000000000002', 60.3, 357.58, 25864, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000017', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -2), '00000000-0000-0000-0001-000000000003', 76.5, 468.18, 96770, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000018', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -11), '00000000-0000-0000-0001-000000000003', 112.6, 686.86, 95823, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000019', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -26), '00000000-0000-0000-0001-000000000003', 83.4, 533.76, 95210, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000020', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -37), '00000000-0000-0000-0001-000000000003', 44.6, 282.32, 94385, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000021', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -44), '00000000-0000-0000-0001-000000000003', 42.6, 263.27, 93490, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000022', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -60), '00000000-0000-0000-0001-000000000003', 40.3, 256.71, 92810, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000023', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -70), '00000000-0000-0000-0001-000000000003', 55.2, 340.03, 91929, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000024', '00000000-0000-0000-0002-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -80), '00000000-0000-0000-0001-000000000003', 106.1, 640.84, 91330, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000025', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + 0), '00000000-0000-0000-0001-000000000004', 108.1, 662.65, 154265, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000026', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -15), '00000000-0000-0000-0001-000000000004', 106.0, 641.3, 153368, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000027', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -24), '00000000-0000-0000-0001-000000000004', 42.4, 263.3, 152661, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000028', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -36), '00000000-0000-0000-0001-000000000004', 57.1, 365.44, 151883, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000029', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -48), '00000000-0000-0000-0001-000000000004', 105.4, 639.78, 150997, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000030', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -59), '00000000-0000-0000-0001-000000000004', 95.3, 607.06, 150369, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000031', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -70), '00000000-0000-0000-0001-000000000004', 89.2, 561.07, 149558, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000032', '00000000-0000-0000-0002-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -79), '00000000-0000-0000-0001-000000000004', 64.5, 390.87, 148738, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000033', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -2), '00000000-0000-0000-0001-000000000005', 45.3, 261.83, 41961, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000034', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -12), '00000000-0000-0000-0001-000000000005', 46.0, 279.68, 41172, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000035', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -26), '00000000-0000-0000-0001-000000000005', 41.8, 246.2, 40528, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000036', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -35), '00000000-0000-0000-0001-000000000005', 45.6, 264.02, 39618, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000037', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -48), '00000000-0000-0000-0001-000000000005', 47.5, 279.77, 38896, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000038', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -56), '00000000-0000-0000-0001-000000000005', 27.3, 158.07, 38198, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000039', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -67), '00000000-0000-0000-0001-000000000005', 31.7, 190.2, 37323, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000040', '00000000-0000-0000-0002-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -79), '00000000-0000-0000-0001-000000000005', 16.3, 96.99, 36491, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000041', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -5), '00000000-0000-0000-0001-000000000006', 103.7, 628.42, 88546, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000042', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -15), '00000000-0000-0000-0001-000000000006', 47.5, 287.38, 87729, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000043', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -24), '00000000-0000-0000-0001-000000000006', 92.6, 588.01, 86961, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000044', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -38), '00000000-0000-0000-0001-000000000006', 82.4, 513.35, 86274, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000045', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -44), '00000000-0000-0000-0001-000000000006', 80.0, 492.0, 85457, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000046', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -58), '00000000-0000-0000-0001-000000000006', 55.0, 348.15, 84744, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000047', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -71), '00000000-0000-0000-0001-000000000006', 89.1, 570.24, 83963, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000048', '00000000-0000-0000-0002-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -77), '00000000-0000-0000-0001-000000000006', 64.7, 396.61, 83198, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000049', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -3), '00000000-0000-0000-0001-000000000001', 61.3, 356.15, 120954, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000050', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -15), '00000000-0000-0000-0001-000000000001', 76.9, 440.64, 120206, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000051', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -23), '00000000-0000-0000-0001-000000000001', 102.7, 624.42, 119412, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000052', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -34), '00000000-0000-0000-0001-000000000001', 63.8, 384.71, 118515, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000053', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -48), '00000000-0000-0000-0001-000000000001', 114.4, 665.81, 117870, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000054', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -60), '00000000-0000-0000-0001-000000000001', 44.5, 262.1, 116914, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000055', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -66), '00000000-0000-0000-0001-000000000001', 101.9, 620.57, 116182, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000056', '00000000-0000-0000-0002-000000000007', ((now() at time zone 'America/Sao_Paulo')::date + -82), '00000000-0000-0000-0001-000000000001', 91.1, 523.82, 115347, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000057', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -5), '00000000-0000-0000-0001-000000000002', 58.2, 368.99, 203335, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000058', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -13), '00000000-0000-0000-0001-000000000002', 98.5, 608.73, 202599, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000059', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -22), '00000000-0000-0000-0001-000000000002', 69.9, 438.97, 201809, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000060', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -37), '00000000-0000-0000-0001-000000000002', 103.6, 628.85, 201056, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000061', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -46), '00000000-0000-0000-0001-000000000002', 78.9, 494.7, 200269, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000062', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -60), '00000000-0000-0000-0001-000000000002', 86.9, 539.65, 199462, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000063', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -69), '00000000-0000-0000-0001-000000000002', 67.0, 410.04, 198531, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000064', '00000000-0000-0000-0002-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -81), '00000000-0000-0000-0001-000000000002', 66.7, 406.2, 197835, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000065', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -3), '00000000-0000-0000-0001-000000000003', 82.8, 475.27, 76734, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000066', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -14), '00000000-0000-0000-0001-000000000003', 108.0, 645.84, 75970, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000067', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -24), '00000000-0000-0000-0001-000000000003', 74.8, 453.29, 75323, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000068', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -34), '00000000-0000-0000-0001-000000000003', 113.1, 665.03, 74512, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000069', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -46), '00000000-0000-0000-0001-000000000003', 79.3, 468.66, 73681, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000070', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -60), '00000000-0000-0000-0001-000000000003', 54.3, 317.11, 72975, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000071', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -69), '00000000-0000-0000-0001-000000000003', 53.2, 304.3, 72087, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000072', '00000000-0000-0000-0002-000000000009', ((now() at time zone 'America/Sao_Paulo')::date + -77), '00000000-0000-0000-0001-000000000003', 117.5, 670.92, 71275, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000073', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -2), '00000000-0000-0000-0001-000000000004', 31.2, 184.08, 18395, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000074', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -16), '00000000-0000-0000-0001-000000000004', 41.1, 247.83, 17589, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000075', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -26), '00000000-0000-0000-0001-000000000004', 37.6, 222.97, 16696, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000076', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -35), '00000000-0000-0000-0001-000000000004', 43.6, 258.55, 16060, 'Auto Posto Beira Rio'),
    ('00000000-0000-0000-0004-000000000077', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -44), '00000000-0000-0000-0001-000000000004', 37.3, 225.29, 15166, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000078', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -58), '00000000-0000-0000-0001-000000000004', 19.6, 117.21, 14404, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000079', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -67), '00000000-0000-0000-0001-000000000004', 38.5, 234.85, 13613, 'Posto Alvorada'),
    ('00000000-0000-0000-0004-000000000080', '00000000-0000-0000-0002-000000000010', ((now() at time zone 'America/Sao_Paulo')::date + -77), '00000000-0000-0000-0001-000000000004', 31.0, 180.42, 12781, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000081', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -1), '00000000-0000-0000-0001-000000000005', 10.4, 64.9, 24507, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000082', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -15), '00000000-0000-0000-0001-000000000005', 7.9, 48.9, 23822, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000083', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -23), '00000000-0000-0000-0001-000000000005', 9.3, 58.31, 23062, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000084', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -37), '00000000-0000-0000-0001-000000000005', 5.3, 33.44, 22210, 'Posto Shell BR-116'),
    ('00000000-0000-0000-0004-000000000085', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -44), '00000000-0000-0000-0001-000000000005', 9.4, 60.82, 21543, 'Posto Ipiranga Centro'),
    ('00000000-0000-0000-0004-000000000086', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -55), '00000000-0000-0000-0001-000000000005', 7.2, 45.5, 20657, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000087', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -69), '00000000-0000-0000-0001-000000000005', 5.9, 37.05, 19839, 'Posto Petrobras Norte'),
    ('00000000-0000-0000-0004-000000000088', '00000000-0000-0000-0002-000000000011', ((now() at time zone 'America/Sao_Paulo')::date + -82), '00000000-0000-0000-0001-000000000005', 9.9, 63.76, 19061, 'Posto Ipiranga Centro');

  -- Manutenções
  insert into public.manutencoes (id, veiculo_id, tipo, descricao, status, data_servico, oficina, valor, odometro, proxima_data, proximo_km) values
    ('00000000-0000-0000-0005-000000000001', '00000000-0000-0000-0002-000000000001', 'preventiva', 'Troca de óleo e filtros', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -30), 'Auto Center Toyoloc', 780.0, 47450, ((now() at time zone 'America/Sao_Paulo')::date + 150), 63200),
    ('00000000-0000-0000-0005-000000000002', '00000000-0000-0000-0002-000000000003', 'revisao', 'Revisão dos 100.000 km', 'agendada', ((now() at time zone 'America/Sao_Paulo')::date + 6), 'Mercedes-Benz Concessionária', 3200.0, 96800, null, null),
    ('00000000-0000-0000-0005-000000000003', '00000000-0000-0000-0002-000000000004', 'corretiva', 'Troca do kit de embreagem', 'andamento', ((now() at time zone 'America/Sao_Paulo')::date + -2), 'Oficina Irmãos Prado', 4850.0, 154250, null, null),
    ('00000000-0000-0000-0005-000000000004', '00000000-0000-0000-0002-000000000005', 'pneus', 'Alinhamento e balanceamento', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -45), 'Pneus Vale', 220.0, 40975, null, null),
    ('00000000-0000-0000-0005-000000000005', '00000000-0000-0000-0002-000000000006', 'preventiva', 'Revisão de freios', 'agendada', ((now() at time zone 'America/Sao_Paulo')::date + 12), 'Oficina Irmãos Prado', 950.0, 88700, null, null),
    ('00000000-0000-0000-0005-000000000006', '00000000-0000-0000-0002-000000000008', 'corretiva', 'Reparo no sistema de arrefecimento', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -60), 'Retífica Santa Rita', 2400.0, 201900, null, null),
    ('00000000-0000-0000-0005-000000000007', '00000000-0000-0000-0002-000000000002', 'preventiva', 'Troca de óleo', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -75), 'Fiat Autostar', 420.0, 29625, ((now() at time zone 'America/Sao_Paulo')::date + 105), 41500),
    ('00000000-0000-0000-0005-000000000008', '00000000-0000-0000-0002-000000000007', 'pneus', 'Troca dos 4 pneus', 'agendada', ((now() at time zone 'America/Sao_Paulo')::date + 20), 'Pneus Vale', 2650.0, 121000, null, null),
    ('00000000-0000-0000-0005-000000000009', '00000000-0000-0000-0002-000000000010', 'revisao', 'Primeira revisão', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -20), 'Fiat Autostar', 380.0, 17900, ((now() at time zone 'America/Sao_Paulo')::date + 160), 28400),
    ('00000000-0000-0000-0005-000000000010', '00000000-0000-0000-0002-000000000011', 'preventiva', 'Troca de corrente e relação', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -35), 'Moto Center Honda', 640.0, 23825, ((now() at time zone 'America/Sao_Paulo')::date + 145), null),
    ('00000000-0000-0000-0005-000000000011', '00000000-0000-0000-0002-000000000009', 'outros', 'Higienização e polimento', 'concluida', ((now() at time zone 'America/Sao_Paulo')::date + -90), 'Estética Auto Brilho', 350.0, 74650, null, null),
    ('00000000-0000-0000-0005-000000000012', '00000000-0000-0000-0002-000000000001', 'pneus', 'Rodízio de pneus', 'agendada', ((now() at time zone 'America/Sao_Paulo')::date + 30), 'Pneus Vale', 180.0, 48200, null, null);

  -- Despesas da frota
  insert into public.despesas (id, descricao, categoria, veiculo_id, valor, vencimento, status, pago_em, fornecedor) values
    ('00000000-0000-0000-0006-000000000001', 'IPVA 2026 — Hilux', 'ipva', '00000000-0000-0000-0002-000000000001', 4250.0, ((now() at time zone 'America/Sao_Paulo')::date + 75), 'a_pagar', null, 'Tracker Brasil'),
    ('00000000-0000-0000-0006-000000000002', 'IPVA 2026 — Sprinter', 'ipva', '00000000-0000-0000-0002-000000000003', 3180.0, ((now() at time zone 'America/Sao_Paulo')::date + 140), 'a_pagar', null, 'Detran-SP'),
    ('00000000-0000-0000-0006-000000000003', 'Seguro anual da frota', 'seguro', null, 18400.0, ((now() at time zone 'America/Sao_Paulo')::date + 30), 'a_pagar', null, 'Tracker Brasil'),
    ('00000000-0000-0000-0006-000000000004', 'Pedágios do mês', 'pedagio', null, 1260.0, ((now() at time zone 'America/Sao_Paulo')::date + -8), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -8), 'Auto Lavagem Brilho'),
    ('00000000-0000-0000-0006-000000000005', 'Lavagem mensal — frota', 'lavagem', null, 780.0, ((now() at time zone 'America/Sao_Paulo')::date + -15), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -15), 'Detran-SP'),
    ('00000000-0000-0000-0006-000000000006', 'Rastreador — mensalidade', 'rastreador', null, 890.0, ((now() at time zone 'America/Sao_Paulo')::date + 6), 'a_pagar', null, 'Auto Lavagem Brilho'),
    ('00000000-0000-0000-0006-000000000007', 'Seguro Sprinter (parcela 3/10)', 'seguro', '00000000-0000-0000-0002-000000000003', 612.0, ((now() at time zone 'America/Sao_Paulo')::date + -30), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -30), 'Detran-SP'),
    ('00000000-0000-0000-0006-000000000008', 'Estacionamento — centro', 'estacionamento', null, 340.0, ((now() at time zone 'America/Sao_Paulo')::date + -4), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -4), 'Sem Parar'),
    ('00000000-0000-0000-0006-000000000009', 'IPVA 2026 — Strada', 'ipva', '00000000-0000-0000-0002-000000000002', 2890.0, ((now() at time zone 'America/Sao_Paulo')::date + -20), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -21), 'Porto Seguro'),
    ('00000000-0000-0000-0006-000000000010', 'Pedágios — viagem a Goiânia', 'pedagio', '00000000-0000-0000-0002-000000000003', 420.0, ((now() at time zone 'America/Sao_Paulo')::date + -11), 'paga', ((now() at time zone 'America/Sao_Paulo')::date + -11), 'Porto Seguro');

  -- Multas
  insert into public.multas (id, veiculo_id, motorista_id, data, infracao, pontos, valor, vencimento, status) values
    ('00000000-0000-0000-0007-000000000001', '00000000-0000-0000-0002-000000000002', '00000000-0000-0000-0001-000000000003', ((now() at time zone 'America/Sao_Paulo')::date + -18), 'Excesso de velocidade até 20% (Av. Brasil)', 4, 130.16, ((now() at time zone 'America/Sao_Paulo')::date + 12), 'a_pagar'),
    ('00000000-0000-0000-0007-000000000002', '00000000-0000-0000-0002-000000000005', '00000000-0000-0000-0001-000000000005', ((now() at time zone 'America/Sao_Paulo')::date + -40), 'Estacionar em local proibido', 3, 195.23, ((now() at time zone 'America/Sao_Paulo')::date + -10), 'paga'),
    ('00000000-0000-0000-0007-000000000003', '00000000-0000-0000-0002-000000000001', '00000000-0000-0000-0001-000000000001', ((now() at time zone 'America/Sao_Paulo')::date + -25), 'Avanço de sinal vermelho', 7, 293.47, ((now() at time zone 'America/Sao_Paulo')::date + 5), 'a_pagar'),
    ('00000000-0000-0000-0007-000000000004', '00000000-0000-0000-0002-000000000003', '00000000-0000-0000-0001-000000000004', ((now() at time zone 'America/Sao_Paulo')::date + -55), 'Transitar em faixa exclusiva de ônibus', 5, 195.23, ((now() at time zone 'America/Sao_Paulo')::date + -25), 'paga'),
    ('00000000-0000-0000-0007-000000000005', '00000000-0000-0000-0002-000000000006', '00000000-0000-0000-0001-000000000006', ((now() at time zone 'America/Sao_Paulo')::date + -10), 'Excesso de velocidade de 20% a 50%', 5, 195.23, ((now() at time zone 'America/Sao_Paulo')::date + 20), 'recorrida'),
    ('00000000-0000-0000-0007-000000000006', '00000000-0000-0000-0002-000000000008', '00000000-0000-0000-0001-000000000008', ((now() at time zone 'America/Sao_Paulo')::date + -70), 'Falta de cinto de segurança', 5, 195.23, ((now() at time zone 'America/Sao_Paulo')::date + -40), 'paga');

end $seed$;
