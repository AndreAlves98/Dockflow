package agendamento.br.dockflow.repository;
import agendamento.br.dockflow.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;

public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
}
