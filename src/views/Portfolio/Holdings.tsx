import { DataTable, Column } from 'primevue/datatable';

function Holdings(props) {
  return (
    <div>
      <DataTable value={props.holdings} scrollable scrollHeight="400px" class="mt-4">
        <Column field="name" header="Name" style="min-width: 200px" frozen class="font-bold"></Column>
        <Column field="id" header="Id" style="min-width: 100px"></Column>
        <Column field="name" header="Name" style="min-width: 200px"></Column>
        <Column field="country.name" header="Country" style="min-width: 200px"></Column>
        <Column field="date" header="Date" style="min-width: 200px"></Column>
        <Column field="company" header="Company" style="min-width: 200px"></Column>
        <Column field="status" header="Status" style="min-width: 200px"></Column>
        <Column field="activity" header="Activity" style="min-width: 200px"></Column>
        <Column field="representative.name" header="Representative" style="min-width: 200px"></Column>
        <Column field="balance" header="Balance" style="min-width: 200px" alignFrozen="right">
          <template #body={data}>
            <span class="font-bold">{formatCurrency(data.balance)}</span>
          </template>
        </Column>
      </DataTable>
    </div>
  )
}

export default Holdings