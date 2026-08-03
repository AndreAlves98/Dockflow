package agendamento.br.dockflow.controller;

import agendamento.br.dockflow.model.Agendamento;
import agendamento.br.dockflow.service.AgendamentoService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/agendamentos")
@CrossOrigin(origins = "*") // Importante: Libera o acesso para o seu HTML/JS local
public class AgendamentoController {

    @Autowired
    private AgendamentoService service;

    @GetMapping
    public ResponseEntity<List<Agendamento>> listarTodos() {
        return ResponseEntity.ok(service.obterTodos());
    }

    @PostMapping
    public ResponseEntity<Agendamento> salvarNovo(@RequestBody Agendamento agendamento) {
        Agendamento salvo = service.salvarNovo(agendamento);
        return ResponseEntity.ok(salvo);
    }

    @PutMapping("/{protocolo}")
    public ResponseEntity<Agendamento> atualizarExistente(
            @PathVariable String protocolo,
            @RequestBody Agendamento dadosEditados) {
        try {
            Agendamento atualizado = service.atualizarExistente(protocolo, dadosEditados);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }

    @PatchMapping("/{protocolo}/status")
    public ResponseEntity<Agendamento> alterarStatus(
            @PathVariable String protocolo,
            @RequestBody Agendamento dadosStatus) {
        try {
            Agendamento atualizado = service.alterarStatus(protocolo, dadosStatus);
            return ResponseEntity.ok(atualizado);
        } catch (RuntimeException e) {
            return ResponseEntity.notFound().build();
        }
    }
}
