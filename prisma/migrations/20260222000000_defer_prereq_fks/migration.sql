-- Make prereq circular FKs deferrable for seed inserts
ALTER TABLE "prereq_expressions" DROP CONSTRAINT "prereq_expressions_root_node_id_fkey";
ALTER TABLE "prereq_expressions" ADD CONSTRAINT "prereq_expressions_root_node_id_fkey"
  FOREIGN KEY ("root_node_id") REFERENCES "prereq_nodes"("id") ON DELETE RESTRICT ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;

ALTER TABLE "prereq_nodes" DROP CONSTRAINT "prereq_nodes_expression_id_fkey";
ALTER TABLE "prereq_nodes" ADD CONSTRAINT "prereq_nodes_expression_id_fkey"
  FOREIGN KEY ("expression_id") REFERENCES "prereq_expressions"("id") ON DELETE CASCADE ON UPDATE CASCADE DEFERRABLE INITIALLY DEFERRED;
