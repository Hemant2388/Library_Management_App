export default {
    template: `<div>
    Welcome to Librarian Dashboard<br><br>
    <div>
        <div><h3>Sections</h3></div>
            <div class = "text-danger" v-if="error"><h3>{{ error }}</h3></div>
            <div class = "row">
                <div class="card my-3 mx-3 col-5 border-success" style="width: 18rem;" v-for="(section, index) in allSections">
                    <div class="card-body">
                        <h5 class="card-title">{{ section.name }}</h5>
                        <p class="card-text">{{ section.description }}</p>
                        <!-- Button trigger modal -->
                        <button type="button" class="btn btn-outline-success" data-bs-toggle="modal" :data-bs-target="'#updateModal' + index">
                        Update
                        </button>
                    
                        <!-- Modal -->
                        <div class="modal fade" :id="'updateModal' + index" tabindex="-1" aria-labelledby="updateModalLabel" aria-hidden="true">
                        <div class="modal-dialog">
                            <div class="modal-content">
                            <div class="modal-header">
                                <h1 class="modal-title fs-5" id="updateModalLabel">Update Section</h1>
                                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
                            </div>
                            <div class="modal-body">
                                <div class="text-danger" v-if="error3"><h5>{{ error3 }}</h5></div>
                                <label for="updated_section_name" class="form-label">Section Name</label>
                                <input type="text" class="form-control" id="updated_section_name"  v-model="updated_section_name">
                                <label for="updated_section_description" class="form-label">Section Description</label>
                                <textarea class="form-control" id="updated_section_description" v-model="updated_section_description"></textarea>
                            </div>
                            <div class="modal-footer">
                                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                                <button type="button" class="btn btn-primary" @click="updateSection(section.id)">Update Section</button>
                            </div>
                            </div>
                        </div>
                        </div>
                        <button class="card-link btn btn-outline-danger" @click="deleteSection(section.id)">Delete</button>
                        <br><br>
                        <router-link  :to="{ path: '/books/' + section.name + '/' + section.id }""><button class="btn btn-dark">View Books Under this Section</button></router-link>
                    </div>
                </div>
            </div>
    </div>
    <!-- Button trigger modal -->
    <button type="button" class="btn btn-primary" data-bs-toggle="modal" data-bs-target="#exampleModal">
    Add New Section
    </button>

    <!-- Modal -->
    <div class="modal fade" id="exampleModal" tabindex="-1" aria-labelledby="exampleModalLabel" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
        <div class="modal-header">
            <h1 class="modal-title fs-5" id="exampleModalLabel">Add New Section</h1>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
        </div>
        <div class="modal-body">
            <div class="text-danger" v-if="error1"><h5>{{ error1 }}</h5></div>
            <label for="section_name" class="form-label">Section Name</label>
            <input type="text" class="form-control" id="section_name"  v-model="section_name">
            <label for="section_description" class="form-label">Section Description</label>
            <textarea class="form-control" id="section_description" v-model="section_description"></textarea>
        </div>
        <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            <button type="button" class="btn btn-primary" @click="addSection">Add Section</button>
        </div>
        </div>
    </div>
    </div>
    </div>
    `,
    data() {
        return {
            allSections : [],
            token: localStorage.getItem('auth-token'),
            error: null,
            error1:null,
            error3: null,
            section_name : null,
            section_description : null,
            updated_section_name : null,
            updated_section_description : null
        }
    },
    async mounted() {
        const res = await fetch('/sections', {
            headers: {
                'Authentication-Token' : this.token,
            },
        })
        const data = await res.json()
        if (res.ok) {
            this.allSections = data
        }
        else {
            this.error= data.message
        }
    },
    methods : {
        async addSection() {
            const sectionData = {
                section_name: this.section_name,
                section_description: this.section_description
              };
              const res = await fetch('/add-sections', {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                  "Authentication-Token": this.token
                },
                body: JSON.stringify(sectionData)
              });
                if (res.ok) {
                    const data = await res.json()
                    this.$router.go(0)
                }
                else{
                    const data = await res.json()
                    this.error1 = data.message
                }
        },
        async deleteSection(id) {
            if(confirm("To delete, you must first delete all the books under it. Are you sure you want to proceed?")) {
                const res = await fetch(`/delete-sections/${id}`, {
                    method: 'DELETE',
                    headers : {
                        'Content-Type': 'application/json',
                        "Authentication-Token": this.token
                    },
                });
                if (res.ok) {
                    this.$router.go(0)
                }
            }
        },
        async updateSection(id) {
            const updatedSectionData = {
                updated_section_name: this.updated_section_name,
                updated_section_description: this.updated_section_description
              };
              const res = await fetch(`/update-sections/${id}`, {
                method: 'PUT',
                headers: {
                  'Content-Type': 'application/json',
                  "Authentication-Token": this.token
                },
                body: JSON.stringify(updatedSectionData)
            });
            if (res.ok) {
                const data = await res.json()
                this.$router.go(0)
            }
            else{
                const data = await res.json()
                this.error3 = data.message
            }
        },
        toBooks() {
            this.$router.push('/books')
        }

    }
}
