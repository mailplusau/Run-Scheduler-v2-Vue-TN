<template>
    <v-data-table :headers="headers" :items="customers"
                  :search="search"
                  :loading="loading"
                  :no-data-text="franchisee ? 'No Customer belongs to this franchisee' : 'Please select a franchisee first'"
                  :items-per-page="5"
                  class="elevation-5 background" :hide-default-footer="customers.length <= 5" loading-text="Loading customers..."
                  show-expand single-select @click:row="handleRowClick" v-model="selectedRow" item-key="internalid">

        <template v-slot:top>
            <v-toolbar flat dense color="primary" dark>
                <v-toolbar-title>Customers</v-toolbar-title>
                <v-divider class="mx-4" inset vertical></v-divider>
                <v-toolbar-title class="caption yellow--text">
                    {{ '' }}
                </v-toolbar-title>

                <v-spacer></v-spacer>

                <v-autocomplete prefix="Franchisee:"
                                v-model="franchisee"
                                :items="franchisees"
                                item-value="internalid"
                                item-text="companyname"
                                placeholder="(Select a franchisee)"
                                hide-details dense solo-inverted></v-autocomplete>

                <v-slide-x-transition leave-absolute hide-on-leave>
                    <v-btn icon v-if="!searchEnabled" @click.stop="enableSearch" key="0"><v-icon>mdi-magnify</v-icon></v-btn>
                    <v-text-field v-else key="1" label="" placeholder="Search..." class="ml-2" ref="customerSearch"
                                  clearable
                                  v-model="search" @blur="disableSearch"
                                  hide-details dense solo-inverted append-icon="mdi-magnify"></v-text-field>
                </v-slide-x-transition>
            </v-toolbar>
        </template>

        <template v-slot:item.data-table-expand="{ expand, item, isSelected }">
            <v-icon title="Editing this customer's service stops">{{isSelected ? 'mdi-arrow-right' : ''}}</v-icon>
        </template>

        <template v-slot:item.isScheduled="{ item }">
            <v-icon :color="item.isScheduled ? 'green' : 'red'">
                {{ item.isScheduled ? 'mdi-check' : 'mdi-close'}}
            </v-icon>
        </template>


        <template v-slot:item.actions="{ item }">
            <v-card-actions>
                <v-btn color="primary" block><v-icon>mdi-pencil</v-icon></v-btn>
            </v-card-actions>
        </template>

        <template v-slot:expanded-item="{ headers, item }">
            <td :colspan="headers.length">
                More info about {{ item.name }}
            </td>
        </template>

    </v-data-table>
</template>

<script>
export default {
    name: "CustomerTable",
    data: () => ({
        selectedRow: [],
        headers: [
            {value: 'internalid', text: 'ID', align: 'start'},
            {value: 'companyname', text: 'Name', align: 'center', sortable: false},
            {value: 'isScheduled', text: 'Scheduled', align: 'center', sortable: false},
            {value: 'data-table-expand', text: ''},
        ],
        search: '',
        searchEnabled: false,
    }),
    methods: {
        handleRowClick(e, v) {
            this.selectedRow.splice(0, 1, v.item);
            this.$store.dispatch('customers/setSelected', v.item['internalid']);
        },
        enableSearch() {
            this.searchEnabled = true;
            this.$nextTick(() => {
                this.$refs?.customerSearch?.focus();
            })
        },
        disableSearch() {
            if (!this.search) this.searchEnabled = false;
        }
    },
    computed: {
        customers() {
            return this.$store.getters['customers/data'];
        },
        franchisees() {
            return this.$store.getters['franchisees/all'];
        },
        franchisee: {
            get() {
                return this.$store.getters['franchisees/selected'];
            },
            set(val) {
                this.$store.dispatch('franchisees/setSelected', val);
            }
        },
        loading() {
            return this.$store.getters['customers/loading'];
        }
    }
};
</script>

<style scoped>

</style>