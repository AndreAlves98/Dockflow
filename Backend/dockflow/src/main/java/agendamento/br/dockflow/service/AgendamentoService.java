package agendamento.br.dockflow.service;

import agendamento.br.dockflow.model.Agendamento;
import agendamento.br.dockflow.repository.AgendamentoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.Optional;
import java.util.Random;

@Service
public class AgendamentoService {

    @Autowired
    private AgendamentoRepository repository;

    public List<Agendamento> obterTodos() {
        return repository.findAll();
    }

    public Agendamento salvarNovo(Agendamento agendamento) {
        // Gera o protocolo automaticamente no backend se não existir
        if (agendamento.getProtocolo() == null || agendamento.getProtocolo().isEmpty()) {
            agendamento.setProtocolo(gerarProtocolo());
            agendamento.setStatus("Agendado");
        }
        return repository.save(agendamento);
    }

    public Agendamento atualizarExistente(String protocolo, Agendamento dadosEditados) {
        Optional<Agendamento> agendamentoBanco = repository.findById(protocolo);

        if (agendamentoBanco.isPresent()) {
            Agendamento ag = agendamentoBanco.get();

            // Atualizando os dados
            ag.setTransportadora(dadosEditados.getTransportadora());
            ag.setFornecedor(dadosEditados.getFornecedor());
            ag.setMotorista(dadosEditados.getMotorista());
            ag.setTelefone(dadosEditados.getTelefone());
            ag.setEmail(dadosEditados.getEmail());
            ag.setPlacaVeiculo(dadosEditados.getPlacaVeiculo());
            ag.setTipoVeiculo(dadosEditados.getTipoVeiculo());
            ag.setData(dadosEditados.getData());
            ag.setHorario(dadosEditados.getHorario());
            ag.setTipoCarga(dadosEditados.getTipoCarga());
            ag.setPeso(dadosEditados.getPeso());
            ag.setVolume(dadosEditados.getVolume());
            ag.setPedido(dadosEditados.getPedido());
            ag.setNotaFiscal(dadosEditados.getNotaFiscal());
            ag.setObservacoes(dadosEditados.getObservacoes());

            if (dadosEditados.getArquivoNF() != null) {
                ag.setArquivoNF(dadosEditados.getArquivoNF());
            }

            return repository.save(ag);
        }
        throw new RuntimeException("Agendamento não encontrado no banco de dados.");
    }

    public Agendamento alterarStatus(String protocolo, Agendamento dadosStatus) {
        Optional<Agendamento> agendamentoBanco = repository.findById(protocolo);

        if (agendamentoBanco.isPresent()) {
            Agendamento ag = agendamentoBanco.get();
            ag.setStatus(dadosStatus.getStatus());
            ag.setMotivoCancelamento(dadosStatus.getMotivoCancelamento());
            ag.setObsCancelamento(dadosStatus.getObsCancelamento());

            return repository.save(ag);
        }
        throw new RuntimeException("Agendamento não encontrado.");
    }

    private String gerarProtocolo() {
        LocalDate hoje = LocalDate.now();
        String dataFormatada = hoje.format(DateTimeFormatter.ofPattern("ddMMuuuu"));

        String caracteres = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder aleatorio = new StringBuilder();
        Random rnd = new Random();

        for (int i = 0; i < 2; i++) {
            aleatorio.append(caracteres.charAt(rnd.nextInt(caracteres.length())));
        }

        return "COR" + dataFormatada + "DF" + aleatorio.toString();
    }
}
