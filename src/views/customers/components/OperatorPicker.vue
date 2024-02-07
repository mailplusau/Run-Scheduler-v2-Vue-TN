<script>
import {rules} from '@/utils/utils.mjs';

export default {
    name: "OperatorPicker",
    props: {
        value: {
            type: String | null,
            required: true,
        },
        prefix: {
            type: String,
            default: '',
            required: false,
        },
        prependIcon: {
            type: String,
            default: 'mdi-account',
            required: false,
        },
        placeholder: {
            type: String,
            default: '',
            required: false,
        },
        rules: {
            type: Array,
            default: () => ([]),
            required: false,
        }
    },
    data: () => ({
        dialog: false,
        operatorId: null,
        selectedOperatorId: null,
    }),
    mounted() {
        this.selectedOperatorId = this.value;
    },
    methods: {
        validate: rules.validate,
        confirmSelection() {
            this.selectedOperatorId = this.operatorId;
            this.$emit('input', this.selectedOperatorId);
            this.operatorId = null;
            this.dialog = false;
        },
        handleInputCleared() {
            this.selectedOperatorId = null;
            this.$emit('input', this.selectedOperatorId);
        }
    },
    computed: {
        displayText() {
            if (!this.selectedOperatorId) return '';

            let index = this.$store.getters['operators/picker'].data.findIndex(item => item.internalid === this.selectedOperatorId);
            let franchiseeStr = this.selectedFranchisee ? ` (of franchisee ${this.selectedFranchisee})` : '';
            return index >= 0 ? this.$store.getters['operators/picker'].data[index].name + franchiseeStr : '';
        },
        selectedFranchisee() {
            let index = this.$store.getters['franchisees/all'].findIndex(item => item.internalid === this.franchisee);
            return index >= 0 ? this.$store.getters['franchisees/all'][index].companyname : '';
        },
        operators() {
            return this.$store.getters['operators/picker'].data;
        },
        franchisees() {
            return this.$store.getters['franchisees/all'];
        },
        franchisee: {
            get() {
                return this.$store.getters['operators/picker'].selectedFranchisee;
            },
            set(val) {
                this.$store.dispatch('operators/setFranchiseeForPicker', val);
            }
        },
        loading() {
            return this.$store.getters['operators/picker'].loading;
        }
    },
    watch: {
        dialog(val) {
            if (val)
                this.operatorId = this.selectedOperatorId
        }
    }
};
</script>

<template>
    <v-dialog v-model="dialog"
        scrollable
        max-width="350px">
        <template v-slot:activator="{ on, attrs }">
            <v-text-field :prefix="prefix"
                          :placeholder="placeholder"
                          dense outlined
                          :value="displayText" clearable readonly
                          :rules="rules"
                          :prepend-icon="prependIcon" v-bind="attrs" v-on="on" @click:clear="handleInputCleared">
            </v-text-field>
        </template>
        <v-card class="background" :loading="loading" :disabled="loading">
            <v-card-text class="pa-3">
                <v-autocomplete label="Select an operator from franchisee:"
                                v-model="franchisee"
                                :items="franchisees"
                                item-value="internalid"
                                item-text="companyname"
                                dense hide-details outlined
                                placeholder="(Select a franchisee)"></v-autocomplete></v-card-text>

            <v-divider></v-divider>
            <v-card-text style="height: 300px;">
                <p class="text-center subtitle-1 pa-3" v-show="!operators.length">No operator to show</p>
                <v-radio-group
                    v-model="operatorId"
                    column
                >
                    <v-radio v-for="(operator, i) in operators" :key="`operator#${i}`"
                             :label="operator.name" :value="operator.internalid"></v-radio>
                </v-radio-group>
            </v-card-text>
            <v-divider></v-divider>
            <v-card-actions>
                <v-btn text @click="dialog = false">
                    Close
                </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="blue darken-1" text
                    @click="confirmSelection" :disabled="!operatorId">
                    Confirm
                </v-btn>
            </v-card-actions>
        </v-card>
    </v-dialog>
</template>

<style scoped>

</style>