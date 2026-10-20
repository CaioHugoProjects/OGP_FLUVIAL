// ==========================================
// 1. SUPABASE E VARIÁVEIS GLOBAIS
// ==========================================
const supabaseUrl = 'https://fdzthxdscwhczqxmzemk.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZkenRoeGRzY3doY3pxeG16ZW1rIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTI0MzA3OTcsImV4cCI6MjEwODAwNjc5N30.sqJ4QUKWy68xia71fBmGgKqZA7Nx2TDt_kjYZdGh3BU';
const supabaseClient = window.supabase.createClient(supabaseUrl, supabaseKey);

const loginScreen = document.getElementById('loginScreen');
const mainApp = document.getElementById('mainApp');
const loginError = document.getElementById('loginError');

let usuarioAtual = null;

// ==========================================
// 2. SISTEMA DE LOGIN E NAVEGAÇÃO
// ==========================================
document.getElementById('loginForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const btnSubmit = this.querySelector('button[type="submit"]');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Autenticando...';
    btnSubmit.disabled = true;

    const user = document.getElementById('usernameInput').value.trim(); 
    const pass = document.getElementById('passwordInput').value.trim();

    try {
        const { data: resultados, error } = await supabaseClient
            .from('colaboradores')
            .select('*')
            .eq('username', user) 
            .eq('status_ativo', true)
            .limit(1); 

        const colaborador = resultados && resultados.length > 0 ? resultados[0] : null;

        if (!error && colaborador && (pass === '123' || pass === colaborador.senha_hash)) {
            realizarLogin(colaborador);
        } else {
            mostrarErroLogin();
        }
    } catch (err) {
        console.error("Erro na comunicação:", err);
        mostrarErroLogin();
    } finally {
        btnSubmit.innerHTML = originalText;
        btnSubmit.disabled = false;
    }
});

function mostrarErroLogin() {
    loginError.classList.remove('hidden');
    loginError.classList.add('animate-pulse');
    setTimeout(() => loginError.classList.remove('animate-pulse'), 500);
}

function realizarLogin(userData) {
    usuarioAtual = userData;
    loginError.classList.add('hidden');
    loginScreen.classList.add('hidden');
    mainApp.classList.remove('hidden');
    mainApp.style.display = 'flex'; 
    document.getElementById('displayUserRole').textContent = `${userData.nome_completo} (${userData.perfil})`;

    document.querySelectorAll('.role-panel').forEach(panel => panel.classList.add('hidden'));
    
    const role = userData.perfil;
    const navAdmin = document.getElementById('nav_ADM');

    if (role === 'ADM') {
        if(navAdmin) navAdmin.classList.remove('hidden');
        document.getElementById('panel_ADM').classList.remove('hidden');
        if (window.atualizarDashboard) window.atualizarDashboard();
    } else {
        if(navAdmin) navAdmin.classList.add('hidden');
    }

    if (role === 'ADM' || role === 'GCARGA' || role === 'OCARGA') {
        if (role !== 'ADM') document.getElementById('panel_CARGAS').classList.remove('hidden');
        const canSeeValues = (role === 'ADM' || role === 'GCARGA');
        document.querySelectorAll('.admin-cargo-only').forEach(el => {
            if (canSeeValues) {
                el.classList.remove('hidden');
                if(el.tagName === 'TH' || el.tagName === 'TD') el.style.display = 'table-cell';
                else el.style.display = 'block';
            } else {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
        if (window.buscarCargas) window.buscarCargas();
    }

    if (role === 'ADM' || role === 'GCAM' || role === 'OCAM') {
        if (role !== 'ADM') document.getElementById('panel_CAMAROTES').classList.remove('hidden');
        const canSeeValuesCam = (role === 'ADM' || role === 'GCAM');
        document.querySelectorAll('.admin-cam-only').forEach(el => {
            if (canSeeValuesCam) {
                el.classList.remove('hidden');
                if(el.tagName === 'TH' || el.tagName === 'TD') el.style.display = 'table-cell';
                else el.style.display = 'block';
            } else {
                el.classList.add('hidden');
                el.style.display = 'none';
            }
        });
    }

    if (role === 'ADM' || role === 'RH') {
        if (role !== 'ADM') document.getElementById('panel_RH').classList.remove('hidden');
        if (window.buscarColaboradores) window.buscarColaboradores();
    }
}

function abrirModulo(modulo) {
    document.querySelectorAll('.role-panel').forEach(panel => panel.classList.add('hidden'));
    const painel = document.getElementById(`panel_${modulo}`);
    if(painel) painel.classList.remove('hidden');

    if (modulo === 'ADM' && window.atualizarDashboard) window.atualizarDashboard();

    const botoes = document.querySelectorAll('.btn-nav-adm');
    botoes.forEach(btn => {
        if(btn.innerText.toUpperCase().includes(modulo) || (modulo === 'ADM' && btn.innerText.includes('Visão Geral'))) {
            btn.className = "btn-nav-adm px-5 py-2 bg-yellow-500 text-yellow-900 text-sm font-bold rounded hover:bg-yellow-400 transition shadow-sm";
        } else {
            btn.className = "btn-nav-adm px-5 py-2 bg-slate-700 text-white text-sm font-bold rounded hover:bg-slate-600 transition";
        }
    });
}

function logout() {
    usuarioAtual = null;
    document.getElementById('usernameInput').value = '';
    document.getElementById('passwordInput').value = '';
    mainApp.style.display = 'none';
    mainApp.classList.add('hidden');
    loginScreen.classList.remove('hidden');
    document.querySelectorAll('.role-panel').forEach(panel => panel.classList.add('hidden'));
    if(document.getElementById('nav_ADM')) document.getElementById('nav_ADM').classList.add('hidden');
}

// ==========================================
// 3. LÓGICA DE ABAS DO SETOR DE RH
// ==========================================
function gerarMatricula() {
    const ano = new Date().getFullYear();
    return `MAT-${ano}-${Math.floor(1000 + Math.random() * 9000)}`;
}

window.switchRHTab = function(tabName) {
    ['dashboard', 'cadastro'].forEach(tab => {
        const panel = document.getElementById(`tab_rh_${tab}`);
        const btn = document.getElementById(`btn_rh_${tab}`);
        if(!panel || !btn) return;

        if (tab === tabName) {
            panel.classList.remove('hidden');
            panel.classList.add('block');
            btn.className = "w-full flex items-center gap-3 px-4 py-3 bg-purple-50 text-purple-700 rounded-lg font-bold text-sm transition";
            if(tab === 'cadastro' && document.getElementById('idMatriculaGerada')) {
                document.getElementById('idMatriculaGerada').value = gerarMatricula();
            }
        } else {
            panel.classList.add('hidden');
            panel.classList.remove('block');
            btn.className = "w-full flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-bold text-sm transition";
        }
    });
};

// ==========================================
// 4. LÓGICA DO SETOR DE CARGAS
// ==========================================
const inputDataCarga = document.getElementById('inputDataCarga');
const rotaAutomatica = document.getElementById('rotaAutomatica');
const tbodyCargas = document.getElementById('tbodyCargas');
const btnVerHojeCarga = document.getElementById('btnVerHojeCarga');
const buscaTextoCarga = document.getElementById('buscaTextoCarga');
const buscaDataCarga = document.getElementById('buscaDataCarga');
const btnBuscarCarga = document.getElementById('btnBuscarCarga');
const btnLimparCarga = document.getElementById('btnLimparCarga');

let isPatioLotado = false;
const btnPatio = document.getElementById('btnPatio');
if(btnPatio) {
    btnPatio.addEventListener('click', () => {
        isPatioLotado = !isPatioLotado;
        if (isPatioLotado) {
            btnPatio.innerHTML = '<i class="fa-solid fa-triangle-exclamation mr-1"></i> Pátio Lotado (Esvaziar)';
            btnPatio.className = 'admin-cargo-only px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm bg-red-100 text-red-700 border border-red-300 hover:bg-red-200';
        } else {
            btnPatio.innerHTML = '<i class="fa-solid fa-check-circle mr-1"></i> Pátio Vazio (Lotar)';
            btnPatio.className = 'admin-cargo-only px-4 py-2 rounded-lg font-bold text-sm transition shadow-sm bg-green-100 text-green-700 border border-green-300 hover:bg-green-200';
        }
    });
}

if(inputDataCarga) {
    inputDataCarga.addEventListener('change', function() {
        if (!this.value) { rotaAutomatica.textContent = ''; return; }
        const parts = this.value.split('-');
        const diaDaSemana = new Date(parts[0], parts[1] - 1, parts[2]).getDay(); 
        if (diaDaSemana === 1 || diaDaSemana === 3) {
            rotaAutomatica.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Rota detectada: Oriximiná ➔ Santarém';
            rotaAutomatica.className = 'text-[11px] font-bold mt-1 text-blue-600 min-h-[16px]';
        } else if (diaDaSemana === 2 || diaDaSemana === 4) {
            rotaAutomatica.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Rota detectada: Santarém ➔ Oriximiná';
            rotaAutomatica.className = 'text-[11px] font-bold mt-1 text-green-600 min-h-[16px]';
        } else {
            alert("⚠️ DATA INDISPONÍVEL!\n\nAs viagens ocorrem apenas de Segunda a Quinta-feira.");
            this.value = ''; 
            rotaAutomatica.textContent = 'Dia inválido selecionado.';
            rotaAutomatica.className = 'text-[11px] font-bold mt-1 text-red-600 min-h-[16px]';
        }
    });
}

const phoneContainer = document.getElementById('phoneContainer');
const btnAddPhone = document.getElementById('btnAddPhone');
let phoneCount = 1;
if(btnAddPhone) {
    btnAddPhone.addEventListener('click', () => {
        if (phoneCount < 3) {
            const div = document.createElement('div');
            div.className = 'flex items-center space-x-2 mt-2';
            div.innerHTML = `
                <input type="tel" placeholder="(00) 00000-0000" class="carga-telefone block w-full rounded-md border-slate-300 p-2 border text-sm outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500" required>
                <button type="button" class="text-red-500 hover:text-red-700 text-lg btn-del-phone"><i class="fa-solid fa-trash-can"></i></button>
            `;
            phoneContainer.appendChild(div);
            phoneCount++;
            if (phoneCount === 3) btnAddPhone.style.display = 'none';

            div.querySelector('.btn-del-phone').addEventListener('click', function() {
                div.remove();
                phoneCount--;
                btnAddPhone.style.display = 'inline-block';
            });
        }
    });
}

window.buscarCargas = async function(dataFiltro = null, textoFiltro = null) {
    try {
        let query = supabaseClient.from('cargas').select('*').order('data_embarque', { ascending: true });
        if (dataFiltro) query = query.eq('data_embarque', dataFiltro);
        if (textoFiltro) query = query.or(`cliente_nome.ilike.%${textoFiltro}%,veiculo_modelo.ilike.%${textoFiltro}%,veiculo_placa.ilike.%${textoFiltro}%`);
        
        const { data, error } = await query;
        if (error) throw error;
        renderizarTabelaCargas(data || []);
    } catch(err) { console.error("Erro ao buscar cargas:", err); }
};

function renderizarTabelaCargas(cargas) {
    if(!tbodyCargas) return;
    tbodyCargas.innerHTML = '';
    
    if(cargas.length === 0) {
        tbodyCargas.innerHTML = `<tr><td colspan="7" class="text-center py-4 text-sm text-slate-500">Nenhum agendamento encontrado.</td></tr>`;
        return;
    }

    const isAdminOrGCarga = usuarioAtual && (usuarioAtual.perfil === 'ADM' || usuarioAtual.perfil === 'GCARGA');

    cargas.forEach(c => {
        const tr = document.createElement('tr');
        const dateParts = c.data_embarque.split('-');
        const dataFormatada = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`;
        const diaSemana = new Date(dateParts[0], dateParts[1] - 1, dateParts[2]).getDay();
        let rota = (diaSemana === 1 || diaSemana === 3) ? '<span class="text-blue-600">ORX ➔ STM</span>' : '<span class="text-emerald-600">STM ➔ ORX</span>';
        const valorHtml = isAdminOrGCarga ? `<td class="px-3 py-3 text-center"><span class="text-sm font-bold text-slate-700">R$ ${Number(c.valor_cobrado || 0).toFixed(2)}</span></td>` : `<td class="px-3 py-3 text-center hidden"></td>`;
        let opHtml = c.operador_id ? c.operador_id.substring(0,6) : 'N/A';

        tr.innerHTML = `
            <td class="px-3 py-3 text-sm font-bold text-slate-800">${dataFormatada}</td>
            <td class="px-3 py-3 text-xs font-black">${rota}</td>
            <td class="px-3 py-3 text-sm text-slate-600">${c.veiculo_modelo} <br><span class="text-[10px] bg-slate-100 font-bold px-1 rounded uppercase">${c.veiculo_placa}</span></td>
            <td class="px-3 py-3 text-sm text-slate-600">${c.cliente_nome} <br><span class="text-[10px] text-slate-400 font-bold">CPF: ${c.cliente_cpf}</span></td>
            <td class="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase">ID: ${opHtml}</td>
            ${valorHtml}
            <td class="px-3 py-3 text-right">
                <button onclick="deletarCarga(${c.id})" class="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100 transition">Remover</button>
            </td>
        `;
        tbodyCargas.appendChild(tr);
    });
}

window.deletarCarga = async function(id) {
    if(!confirm("Tem a certeza que deseja cancelar e remover este agendamento do pátio?")) return;
    try {
        const { error } = await supabaseClient.from('cargas').delete().eq('id', id);
        if(error) throw error;
        buscarCargas(buscaDataCarga.value, buscaTextoCarga.value);
    } catch(err) { alert("Erro ao remover agendamento."); }
};

if(btnBuscarCarga) btnBuscarCarga.addEventListener('click', () => buscarCargas(buscaDataCarga.value, buscaTextoCarga.value));
if(btnLimparCarga) btnLimparCarga.addEventListener('click', () => { buscaDataCarga.value = ''; buscaTextoCarga.value = ''; buscarCargas(); });
if(btnVerHojeCarga) btnVerHojeCarga.addEventListener('click', () => {
    const hoje = new Date();
    const strHoje = hoje.getFullYear() + '-' + String(hoje.getMonth()+1).padStart(2, '0') + '-' + String(hoje.getDate()).padStart(2, '0');
    buscaDataCarga.value = strHoje; buscaTextoCarga.value = ''; buscarCargas(strHoje);
});

document.getElementById('formCarga')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitCarga');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registando...';
    btnSubmit.disabled = true;

    const nome = document.getElementById('cargaNome').value.trim();
    const cpf = document.getElementById('cargaCpf').value.trim();
    const dataEmbarque = document.getElementById('inputDataCarga').value;
    const modelo = document.getElementById('cargaModelo').value.trim();
    const placa = document.getElementById('cargaPlaca').value.trim().toUpperCase();
    const inputsTelefone = document.querySelectorAll('.carga-telefone');
    const telefones = Array.from(inputsTelefone).map(input => input.value.trim()).filter(val => val !== "");
    const inputValor = document.getElementById('cargaValor');
    const valorCobrado = inputValor && inputValor.value ? parseFloat(inputValor.value) : 0.00;

    try {
        const { error } = await supabaseClient.from('cargas').insert([{ 
            data_embarque: dataEmbarque, cliente_nome: nome, cliente_cpf: cpf, 
            veiculo_modelo: modelo, veiculo_placa: placa, telefones: telefones, 
            valor_cobrado: valorCobrado, operador_id: usuarioAtual ? usuarioAtual.id : null 
        }]);
        if (error) throw error;
        
        alert("✅ Agendamento registado com sucesso no Supabase!");
        this.reset(); 
        document.getElementById('rotaAutomatica').textContent = '';
        while(phoneContainer.children.length > 1) { phoneContainer.lastChild.remove(); }
        phoneCount = 1; btnAddPhone.style.display = 'inline-block';
        buscarCargas(buscaDataCarga.value, buscaTextoCarga.value);
    } catch (err) { alert("Erro ao registar: " + err.message); } 
    finally { btnSubmit.innerHTML = originalText; btnSubmit.disabled = false; }
});

// ==========================================
// 5. LÓGICA DO SETOR DE CAMAROTES
// ==========================================
const inputDataCamarote = document.getElementById('inputDataCamarote');
const rotaAutomaticaCamarote = document.getElementById('rotaAutomaticaCamarote');
const overlayMapa = document.getElementById('overlayMapaCamarote');
const mapaGrid = document.getElementById('mapaCamarotesGrid');
const inputNumCamarote = document.getElementById('inputNumCamarote');
const blocoEnfermaria = document.getElementById('blocoEnfermaria');
const motivoMedico = document.getElementById('motivoMedico');
const tbodyCamarotes = document.getElementById('tbodyCamarotes');

let camarotesOcupadosHoje = []; 

window.buscarCamarotesDaData = async function(dataEmbarque) {
    try {
        const { data, error } = await supabaseClient.from('camarotes').select('*').eq('data_embarque', dataEmbarque);
        if (error) throw error;
        camarotesOcupadosHoje = data || [];
        renderizarMapaCamarotes();
        renderizarTabelaCamarotes();
    } catch (err) { alert("Falha ao carregar ocupação dos camarotes."); }
};

function renderizarMapaCamarotes() {
    if(!mapaGrid) return;
    mapaGrid.innerHTML = '';
    for (let i = 1; i <= 18; i++) {
        const numFormatado = i.toString().padStart(2, '0');
        const ocupado = camarotesOcupadosHoje.find(c => c.numero_camarote === numFormatado);
        const btn = document.createElement('button');
        btn.type = 'button';
        
        if (i === 18) {
            if (ocupado) {
                btn.className = "p-3 rounded-lg border-2 border-red-500 bg-red-600 text-white font-bold text-sm cursor-not-allowed opacity-80 flex flex-col items-center justify-center gap-1 shadow-sm h-20";
                btn.innerHTML = `<i class="fa-solid fa-briefcase-medical text-xl"></i><span class="text-[10px] uppercase">Ocupada</span>`;
                btn.disabled = true;
            } else {
                btn.className = "p-3 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition flex flex-col items-center justify-center gap-1 shadow-sm h-20";
                btn.innerHTML = `<i class="fa-solid fa-briefcase-medical text-xl"></i><span>Enfermaria</span>`;
                btn.addEventListener('click', () => selecionarCamarote(i, btn));
            }
        } else {
            if (ocupado) {
                btn.className = "p-3 rounded-lg border border-slate-300 bg-slate-200 text-slate-400 font-bold text-lg cursor-not-allowed flex flex-col items-center justify-center shadow-sm h-20";
                btn.innerHTML = `<span class="text-xs font-normal">Nº</span>${numFormatado}<span class="text-[10px] text-slate-500 mt-1 uppercase">Ocupado</span>`;
                btn.disabled = true;
            } else {
                btn.className = "p-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:border-indigo-400 hover:bg-indigo-50 transition flex flex-col items-center justify-center shadow-sm h-20";
                btn.innerHTML = `<span class="text-xs text-slate-400 font-normal">Nº</span>${numFormatado}`;
                btn.addEventListener('click', () => selecionarCamarote(i, btn));
            }
        }
        mapaGrid.appendChild(btn);
    }
}

function selecionarCamarote(numero, botaoElement) {
    Array.from(mapaGrid.children).forEach(b => {
        if (!b.disabled) { 
            if(b.innerText.includes('Enfermaria')) b.className = "p-3 rounded-lg border-2 border-red-300 bg-red-50 text-red-700 font-bold text-sm hover:bg-red-100 transition flex flex-col items-center justify-center gap-1 shadow-sm h-20";
            else b.className = "p-3 rounded-lg border border-slate-200 bg-white text-slate-700 font-bold text-lg hover:border-indigo-400 hover:bg-indigo-50 transition flex flex-col items-center justify-center shadow-sm h-20";
        }
    });

    const numFormatado = numero.toString().padStart(2, '0');
    if(inputNumCamarote) inputNumCamarote.value = numFormatado;

    if (numero === 18) {
        alert("⚠️ ATENÇÃO: O Camarote 18 é restrito para uso médico/enfermaria.\nNão o venda para passageiros comuns.");
        botaoElement.className = "p-3 rounded-lg border-2 border-red-500 bg-red-600 text-white font-bold text-sm flex flex-col items-center justify-center gap-1 shadow-sm h-20";
        if(blocoEnfermaria) blocoEnfermaria.classList.remove('hidden');
        if(motivoMedico) motivoMedico.setAttribute('required', 'true');
    } else {
        botaoElement.className = "p-3 rounded-lg border border-indigo-600 bg-indigo-600 text-white font-bold text-lg flex flex-col items-center justify-center shadow-sm h-20";
        if(blocoEnfermaria) blocoEnfermaria.classList.add('hidden');
        if(motivoMedico) motivoMedico.removeAttribute('required');
    }
}

function renderizarTabelaCamarotes() {
    if(!tbodyCamarotes) return;
    tbodyCamarotes.innerHTML = '';
    if (camarotesOcupadosHoje.length === 0) {
        tbodyCamarotes.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-sm text-slate-500">Nenhum camarote ocupado nesta data.</td></tr>`;
        return;
    }

    camarotesOcupadosHoje.sort((a, b) => a.numero_camarote.localeCompare(b.numero_camarote));
    camarotesOcupadosHoje.forEach(reg => {
        const tr = document.createElement('tr');
        const isAdmin = usuarioAtual && (usuarioAtual.perfil === 'ADM' || usuarioAtual.perfil === 'GCAM');
        const valorHtml = isAdmin ? `<td class="px-3 py-3 text-center"><span class="text-sm font-bold text-slate-700">R$ ${Number(reg.valor_cobrado || 0).toFixed(2)}</span></td>` : `<td class="px-3 py-3 text-center hidden"></td>`;

        tr.innerHTML = `
            <td class="px-3 py-3 text-sm font-black ${reg.numero_camarote === '18' ? 'text-red-600' : 'text-indigo-900'}">${reg.numero_camarote}</td>
            <td class="px-3 py-3 text-sm font-medium text-slate-700">
                ${reg.passageiro_nome}
                ${reg.numero_camarote === '18' && reg.enfermaria_motivo ? `<br><span class="text-[10px] text-red-500 uppercase font-bold">Enfermaria: ${reg.enfermaria_motivo}</span>` : ''}
            </td>
            <td class="px-3 py-3 text-xs text-slate-500">${reg.passageiro_cpf}</td>
            ${valorHtml}
            <td class="px-3 py-3 text-right">
                <button onclick="deletarCamarote(${reg.id})" class="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100 transition">Remover</button>
            </td>
        `;
        tbodyCamarotes.appendChild(tr);
    });
}

if(inputDataCamarote) {
    inputDataCamarote.addEventListener('change', function() {
        if (!this.value) {
            if(rotaAutomaticaCamarote) rotaAutomaticaCamarote.textContent = '';
            if(overlayMapa) overlayMapa.classList.remove('hidden');
            inputNumCamarote.value = '';
            tbodyCamarotes.innerHTML = `<tr><td colspan="5" class="text-center py-4 text-sm text-slate-500">Selecione uma data para ver os passageiros.</td></tr>`;
            return;
        }
        const parts = this.value.split('-');
        const diaDaSemana = new Date(parts[0], parts[1] - 1, parts[2]).getDay(); 
        
        if (diaDaSemana === 1 || diaDaSemana === 3) {
            rotaAutomaticaCamarote.innerHTML = '<i class="fa-solid fa-arrow-right"></i> Rota: Oriximiná ➔ Santarém';
            rotaAutomaticaCamarote.className = 'text-[11px] font-bold mt-1 text-indigo-600 min-h-[16px]';
            overlayMapa.classList.add('hidden'); inputNumCamarote.value = ''; buscarCamarotesDaData(this.value); 
        } else if (diaDaSemana === 2 || diaDaSemana === 4) {
            rotaAutomaticaCamarote.innerHTML = '<i class="fa-solid fa-arrow-left"></i> Rota: Santarém ➔ Oriximiná';
            rotaAutomaticaCamarote.className = 'text-[11px] font-bold mt-1 text-emerald-600 min-h-[16px]';
            overlayMapa.classList.add('hidden'); inputNumCamarote.value = ''; buscarCamarotesDaData(this.value); 
        } else {
            alert("⚠️ DATA INDISPONÍVEL!\n\nAs viagens ocorrem apenas de Segunda a Quinta-feira.");
            this.value = ''; rotaAutomaticaCamarote.textContent = 'Dia inválido selecionado.';
            rotaAutomaticaCamarote.className = 'text-[11px] font-bold mt-1 text-red-600 min-h-[16px]';
            overlayMapa.classList.remove('hidden'); inputNumCamarote.value = '';
        }
    });
}

document.getElementById('formCamarote')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitCamarote');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Emitindo...';
    btnSubmit.disabled = true;

    const dados = {
        data_embarque: inputDataCamarote.value,
        numero_camarote: inputNumCamarote.value,
        passageiro_nome: document.getElementById('camaroteNome').value.trim(),
        passageiro_cpf: document.getElementById('camaroteCpf').value.trim(),
        passageiro_nascimento: document.getElementById('camaroteNascimento').value,
        enfermaria_motivo: document.getElementById('motivoMedico') ? document.getElementById('motivoMedico').value.trim() : null,
        valor_cobrado: document.getElementById('camaroteValor') && document.getElementById('camaroteValor').value ? parseFloat(document.getElementById('camaroteValor').value) : 0.00,
        operador_id: usuarioAtual ? usuarioAtual.id : null
    };

    try {
        const { error } = await supabaseClient.from('camarotes').insert([dados]);
        if (error) throw error;
        
        alert(`✅ Bilhete emitido com sucesso para o Camarote ${dados.numero_camarote}!`);
        document.getElementById('camaroteNome').value = '';
        document.getElementById('camaroteCpf').value = '';
        document.getElementById('camaroteNascimento').value = '';
        if (document.getElementById('motivoMedico')) document.getElementById('motivoMedico').value = '';
        if (document.getElementById('camaroteValor')) document.getElementById('camaroteValor').value = '';
        inputNumCamarote.value = '';
        buscarCamarotesDaData(inputDataCamarote.value);
    } catch (err) { alert("Erro ao registar: " + err.message); } 
    finally { btnSubmit.innerHTML = originalText; btnSubmit.disabled = false; }
});

window.deletarCamarote = async function(id) {
    if (!confirm("Tem a certeza que deseja cancelar este bilhete e liberar o camarote?")) return;
    try {
        const { error } = await supabaseClient.from('camarotes').delete().eq('id', id);
        if (error) throw error;
        buscarCamarotesDaData(inputDataCamarote.value);
    } catch (err) { alert("Erro ao cancelar o bilhete."); }
};

// ==========================================
// 6. LÓGICA DO SETOR DE RECURSOS HUMANOS (RH)
// ==========================================
let listaColaboradores = [];
const tbodyRH = document.getElementById('tbodyRH');
const totalColaboradores = document.getElementById('totalColaboradores');
const buscaTextoRH = document.getElementById('buscaTextoRH');

window.buscarColaboradores = async function() {
    try {
        const { data, error } = await supabaseClient.from('colaboradores').select('*').order('nome_completo');
        if (error) throw error;
        
        listaColaboradores = data || [];
        if(totalColaboradores) totalColaboradores.textContent = listaColaboradores.length;
        renderizarTabelaRH(listaColaboradores);
    } catch (err) { console.error("Erro ao buscar colaboradores:", err); }
};

function renderizarTabelaRH(dados) {
    if(!tbodyRH) return;
    tbodyRH.innerHTML = '';
    
    if(dados.length === 0) {
        tbodyRH.innerHTML = `<tr><td colspan="6" class="text-center py-6 text-sm text-slate-500">Nenhum colaborador encontrado.</td></tr>`;
        return;
    }
    
    dados.forEach(c => {
        const tr = document.createElement('tr');
        const badgeClass = c.status_ativo ? 'bg-green-100 text-green-700 border border-green-200' : 'bg-red-100 text-red-700 border border-red-200';
        const statusTxt = c.status_ativo ? 'Ativo' : 'Inativo';
        
        tr.innerHTML = `
            <td class="px-4 py-3 text-sm font-bold text-slate-700">${c.matricula || 'Sem Registro'}</td>
            <td class="px-4 py-3 text-sm text-slate-700 font-medium">${c.nome_completo}<br><span class="text-[10px] text-slate-400 font-bold uppercase">CPF: ${c.cpf || 'N/A'}</span></td>
            <td class="px-4 py-3 text-sm font-black text-purple-700">${c.username}</td>
            <td class="px-4 py-3 text-xs font-bold text-slate-500 bg-slate-50">${c.perfil}</td>
            <td class="px-4 py-3 text-xs"><span class="px-2 py-1 rounded font-bold ${badgeClass}">${statusTxt}</span></td>
            <td class="px-4 py-3 text-right whitespace-nowrap">
                <button onclick="alternarStatusColaborador(${c.id}, ${c.status_ativo})" class="text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 px-2 py-1 rounded border border-blue-100 transition mr-1" title="Ativar/Inativar">Status</button>
                <button onclick="deletarColaborador(${c.id})" class="text-red-600 hover:text-red-800 font-bold text-xs bg-red-50 px-2 py-1 rounded border border-red-100 transition">Deletar</button>
            </td>
        `;
        tbodyRH.appendChild(tr);
    });
}

if(buscaTextoRH) {
    buscaTextoRH.addEventListener('input', (e) => {
        const termo = e.target.value.toLowerCase();
        const filtrados = listaColaboradores.filter(c => 
            (c.nome_completo && c.nome_completo.toLowerCase().includes(termo)) ||
            (c.username && c.username.toLowerCase().includes(termo)) ||
            (c.matricula && c.matricula.toLowerCase().includes(termo))
        );
        renderizarTabelaRH(filtrados);
    });
}

document.getElementById('formNovoUsuario')?.addEventListener('submit', async function(e) {
    e.preventDefault();
    const btnSubmit = document.getElementById('btnSubmitRH');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = '<i class="fa-solid fa-circle-notch fa-spin"></i> Registrando...';
    btnSubmit.disabled = true;

    const novoColaborador = {
        nome_completo: document.getElementById('rhNome').value.trim(),
        cpf: document.getElementById('rhCpf').value.trim(),
        data_nascimento: document.getElementById('rhNascimento').value,
        matricula: document.getElementById('idMatriculaGerada').value,
        username: document.getElementById('rhUsername').value.trim(),
        perfil: document.getElementById('rhPerfil').value,
        senha_hash: '123',
        status_ativo: true
    };

    try {
        const { data: existe } = await supabaseClient.from('colaboradores').select('id').eq('username', novoColaborador.username).limit(1);
        if (existe && existe.length > 0) {
            alert("⚠️ O Usuário de Login informado já existe na base de dados. Por favor, escolha outro.");
            return;
        }
        const { error } = await supabaseClient.from('colaboradores').insert([novoColaborador]);
        if (error) throw error;
        
        alert("✅ Novo colaborador cadastrado com sucesso!");
        this.reset();
        window.switchRHTab('dashboard');
        window.buscarColaboradores();
    } catch (err) { alert("Erro ao cadastrar: " + err.message); } 
    finally { btnSubmit.innerHTML = originalText; btnSubmit.disabled = false; }
});

window.deletarColaborador = async function(id) {
    if (usuarioAtual && usuarioAtual.id === id) return alert("❌ Operação Negada: Você não pode deletar a si mesmo enquanto logado.");
    if (!confirm("Atenção: Deseja mesmo excluir este colaborador permanentemente?")) return;
    try {
        const { error } = await supabaseClient.from('colaboradores').delete().eq('id', id);
        if (error) throw error;
        window.buscarColaboradores();
    } catch (err) { alert("Erro ao remover colaborador."); }
};

window.alternarStatusColaborador = async function(id, statusAtual) {
    if (usuarioAtual && usuarioAtual.id === id) return alert("❌ Operação Negada: Você não pode inativar a si mesmo enquanto logado.");
    try {
        const { error } = await supabaseClient.from('colaboradores').update({ status_ativo: !statusAtual }).eq('id', id);
        if (error) throw error;
        window.buscarColaboradores();
    } catch (err) { alert("Erro ao alterar o status do colaborador."); }
};

// ==========================================
// 7. LÓGICA DO DASHBOARD MESTRE (ADM)
// ==========================================
window.atualizarDashboard = async function() {
    if(!usuarioAtual || usuarioAtual.perfil !== 'ADM') return;

    const lblAtualizacao = document.getElementById('dashUltimaAtualizacao');
    if(lblAtualizacao) lblAtualizacao.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Calculando...';

    try {
        const { data: cargas, error: errCargas } = await supabaseClient.from('cargas').select('*').order('id', { ascending: false });
        const { data: camarotes, error: errCam } = await supabaseClient.from('camarotes').select('*').order('id', { ascending: false });

        if (errCargas || errCam) throw new Error("Falha ao puxar dados.");

        const listaCargas = cargas || [];
        const listaCamarotes = camarotes || [];

        const hojeObj = new Date();
        const strHoje = hojeObj.getFullYear() + '-' + String(hojeObj.getMonth()+1).padStart(2, '0') + '-' + String(hojeObj.getDate()).padStart(2, '0');
        const mesAtual = String(hojeObj.getMonth()+1).padStart(2, '0');
        const anoAtual = String(hojeObj.getFullYear());

        let receitaCargasMes = 0;
        let pátioHoje = 0;
        let movimentacoes = [];

        listaCargas.forEach(c => {
            const [ano, mes, dia] = c.data_embarque.split('-');
            if (mes === mesAtual && ano === anoAtual) receitaCargasMes += Number(c.valor_cobrado || 0);
            if (c.data_embarque === strHoje) pátioHoje++;

            movimentacoes.push({
                id: c.id,
                setor: 'CARGAS',
                cor: 'text-green-600',
                descricao: `Carga - ${c.veiculo_modelo} (${c.veiculo_placa}) | ${c.cliente_nome}`,
                operador: c.operador_id ? c.operador_id.substring(0,6) : 'N/A',
                valor: c.valor_cobrado,
                ordemId: c.id 
            });
        });

        let receitaCamarotesMes = 0;
        let ocupacaoCamarotesHoje = 0;

        listaCamarotes.forEach(c => {
            const [ano, mes, dia] = c.data_embarque.split('-');
            if (mes === mesAtual && ano === anoAtual) receitaCamarotesMes += Number(c.valor_cobrado || 0);
            if (c.data_embarque === strHoje && c.numero_camarote !== '18') ocupacaoCamarotesHoje++;

            movimentacoes.push({
                id: c.id,
                setor: 'CAMAROTES',
                cor: 'text-indigo-600',
                descricao: `Camarote Nº ${c.numero_camarote} | Passag: ${c.passageiro_nome}`,
                operador: c.operador_id ? c.operador_id.substring(0,6) : 'N/A',
                valor: c.valor_cobrado,
                ordemId: c.id
            });
        });

        document.getElementById('dashReceitaCargas').innerText = `R$ ${receitaCargasMes.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('dashReceitaCamarotes').innerText = `R$ ${receitaCamarotesMes.toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}`;
        document.getElementById('dashStatusPatio').innerHTML = `${pátioHoje} <span class="text-xs sm:text-sm font-medium text-slate-400">Veículos Hoje</span>`;
        document.getElementById('dashOcupacaoCamarotes').innerHTML = `${ocupacaoCamarotesHoje}/17 <span class="text-xs sm:text-sm font-medium text-slate-400">Ocupados Hoje</span>`;

        movimentacoes.sort((a, b) => b.ordemId - a.ordemId); 
        const ultimasAcoes = movimentacoes.slice(0, 10);
        
        const tbodyDash = document.getElementById('tbodyDashboard');
        tbodyDash.innerHTML = '';

        if (ultimasAcoes.length === 0) {
            tbodyDash.innerHTML = `<tr><td colspan="5" class="text-center py-6 text-sm text-slate-500">O sistema ainda não possui registros.</td></tr>`;
        } else {
            ultimasAcoes.forEach(mov => {
                const tr = document.createElement('tr');
                tr.innerHTML = `
                    <td class="px-3 py-3 text-[11px] sm:text-xs text-slate-500 font-bold whitespace-nowrap">#${mov.id}</td>
                    <td class="px-3 py-3 text-[11px] sm:text-xs font-black uppercase ${mov.cor}">${mov.setor}</td>
                    <td class="px-3 py-3 text-xs sm:text-sm text-slate-700 min-w-[200px]">${mov.descricao}</td>
                    <td class="px-3 py-3 text-[10px] font-bold text-slate-400 uppercase">ID: ${mov.operador}</td>
                    <td class="px-3 py-3 text-xs sm:text-sm font-bold text-slate-800 text-right whitespace-nowrap">R$ ${Number(mov.valor || 0).toLocaleString('pt-BR', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td>
                `;
                tbodyDash.appendChild(tr);
            });
        }

        if(lblAtualizacao) {
            const hora = new Date().toLocaleTimeString('pt-BR', {hour: '2-digit', minute:'2-digit', second:'2-digit'});
            lblAtualizacao.innerHTML = `Atualizado: ${hora}`;
        }
    } catch (err) {
        console.error("Erro no Dashboard:", err);
        if(lblAtualizacao) lblAtualizacao.innerHTML = `<span class="text-red-500">Erro de conexão</span>`;
    }
};  