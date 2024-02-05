<template>
    <v-dialog v-model="dialogOpen" fullscreen hide-overlay transition="dialog-bottom-transition">
        <v-card class="background">
            <v-container fluid>
                <v-row>
                    <v-col cols="12">
                        <v-data-table :headers="headers2" :items="table2data" :loading="false" no-data-text="No Address to Show" :items-per-page="5"
                                      class="elevation-5 background" :hide-default-footer="table2data.length <= 5" loading-text="Loading customers..."
                                      @click:row="handleRowClick" show-expand single-select :expanded="selectedRow" v-model="selectedRow">

                            <template v-slot:top>
                                <v-toolbar flat dense color="primary" dark>
                                    <v-toolbar-title >Service Stops</v-toolbar-title>
                                    <v-divider class="mx-4" inset vertical></v-divider>
                                    <v-toolbar-title class="caption yellow--text">
                                        {{ selectedRow }}
                                    </v-toolbar-title>

                                    <v-spacer></v-spacer>

                                    <v-btn color="green" @click="dialogOpen = false" small>Save & Close</v-btn>
                                </v-toolbar>
                            </template>

                            <template v-slot:expanded-item="{ headers, item }">
                                <td :colspan="headers.length" style="margin: 0; padding: 0;">
                                    <ServiceStopForm />
                                </td>
                            </template>

                            <template v-slot:item.data-table-expand="{ expand, item, isSelected }">
                                <v-icon title="Editing this customer's service stops">{{isSelected ? 'mdi-plus' : 'mdi-minus'}}</v-icon>
                            </template>

                            <template v-slot:item.actions="{ item }">
                                <v-btn icon color="" title="Inactivate stop" @click.stop=""><v-icon>mdi-arrow-up-bold-outline</v-icon></v-btn>
                                <v-btn icon color="" title="Inactivate stop" @click.stop=""><v-icon>mdi-arrow-down-bold-outline</v-icon></v-btn>
                                <v-btn icon color="primary" title="Edit stop" @click.stop="selectedRow = [item]"><v-icon>mdi-pencil</v-icon></v-btn>
                                <v-btn icon color="red" title="Delete stop" @click.stop=""><v-icon>mdi-delete</v-icon></v-btn>
                            </template>

                            <template v-slot:body.append="{ headers }">
                                <tr>

                                    <td :colspan="headers.length" class="py-5">
                                        <v-btn block color="primary" dark>Add New Stop</v-btn>
                                    </td>
                                </tr>
                            </template>
                        </v-data-table>
                    </v-col>
                </v-row>
            </v-container>
        </v-card>
    </v-dialog>
</template>

<script>
import EditableTimeInput from '@/components/EditableTimeInput.vue';
import ServiceStopForm from '@/views/customers/components/ServiceStopForm.vue';

export default {
    name: "ServiceStopDialog",
    components: {ServiceStopForm, EditableTimeInput},
    props: ['value'],
    data: () => ({
        selectedRow: [],
        headers2: [
            {value: 'actions', text: 'Actions', align: 'start', sortable: false},
            {value: 'name', text: 'Stop Name', align: 'start', sortable: false},
            {value: 'duration', text: 'Duration', align: 'center', sortable: false},
        ],
        table2data: [
            {id: 1, name: 'Adelong LPO', duration: 3600},
            {id: 2, name: 'Test Customer 1', duration: 600},
        ],
        sidePanel: true,
        editDialog: false,
    }),
    methods: {
        handleRowClick(e, v) {
            console.log(e);
            console.log(v);
            if (v.item === this.selectedRow[0])
                this.selectedRow.splice(0);
            else
            this.selectedRow.splice(0, 1, v.item);
        }
    },
    computed: {
        dialogOpen: {
            get() {
                return this.value;
            },
            set(val) {
                this.$emit('input', val);
            }
        }
    }
};
</script>

<style scoped>

</style>