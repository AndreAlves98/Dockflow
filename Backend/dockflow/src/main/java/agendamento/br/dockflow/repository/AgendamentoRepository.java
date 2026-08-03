package agendamento.br.dockflow.repository;
import agendamento.br.dockflow.model.Agendamento;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AgendamentoRepository extends JpaRepository<Agendamento, String> {
}
