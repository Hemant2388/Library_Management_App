export default {
    template : `<div>
                    <div class="container mt-5">
                    <div class="row justify-content-center">
                    <div class="col-md-6">
                        <div class="card">
                        <div class="card-header bg-primary text-white">
                            <h5 class="mb-0">Search Books and Sections</h5>
                        </div>
                        <div class="card-body">
                            <div class="mb-3">
                            <label for="searchTerm" class="form-label">Search Term</label>
                            <input type="text" class="form-control" id="searchTerm" v-model="searchTerm" placeholder="Enter book or section name (must not be an empty string)">
                            </div>
                            <div class="text-center">
                            <button type="button" class="btn btn-primary" @click="search_book">Search Book</button>
                            <button type="button" class="btn btn-primary" @click="search_section">Search Section</button>
                            </div>
                            <div class="mt-3">
                            <div v-if="searchResult" class="alert alert-success" role="alert">
                                {{ searchResult }}
                            </div>
                            <div v-if="error" class="alert alert-danger" role="alert">
                                {{ error }}
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </div>`,
    data() {
        return {
            searchTerm: '',
            searchResult: '',
            error: '',
            token: localStorage.getItem('auth-token'),
        }
    },
    methods: {
        async search_book() {
            this.error = ''; // Clear previous error message
            this.searchResult = ''; // Clear previous search result
            const searchData = {
              searchTerm : this.searchTerm,
            };
            const response = await fetch('/search/book', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token' : this.token,

              },
              body: JSON.stringify(searchData)
            });
              if (response.ok) {
                  const data = await response.json()
                  this.searchResult = data.message              }
              else{
                  const data = await response.json()
                  this.error = data.message
              }
  
          },
          async search_section() {
            this.error = ''; // Clear previous error message
            this.searchResult = ''; // Clear previous search result
            const searchData = {
              searchTerm : this.searchTerm,
            };
            const response = await fetch('/search/section', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
                'Authentication-Token' : this.token,

              },
              body: JSON.stringify(searchData)
            });
              if (response.ok) {
                  const data = await response.json()
                  this.searchResult = data.message
              }
              else{
                  const data = await response.json()
                  this.error = data.message
              }
  
          }
    }
}