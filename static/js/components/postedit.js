const postedit = {
  template:
  `
  <div>
  <h1>Edit blog post</h1>
  {{post}}
  <form>
    <label for="title">Title:</label>
    <input type="text" id="title" v-model="title" size="30"><br><br>

    <label for="image_url">Image URL:</label>
    <input type="text" id="image_url" v-model="imageUrl" size="60"><br><br>

    <label for="description">Description:</label><br>
    <textarea id="description" v-model="description" rows="17" cols="100"></textarea><br><br>

    <button type="submit" v-once @click.once="submitForm">Submit</button>
  </form>
</div>
`,
    data: function() {
      return {
        title: null,
        imageUrl: null,
        description: null,
        pid:null,
      }
    },
    
    methods: {
      getPost() {
      this.pid=this.$route.params.pid
      const url=`http://127.0.0.1:5000/getpost/${this.pid}`;
      fetch(url,{method:"GET",headers: {"Content-Type":"application/json"}})
        .then(resp => resp.json())
        .then(data => {this.title=data.title;
        this.description=data.description;
        this.imageUrl=data.image_URL;
        this.pid=data.post_id;})
        .catch(error => {console.log(error);})},
      
      submitForm() {
        const response = fetch(`http://127.0.0.1:5000/EditPost/${this.pid}`, 
        {method: 'POST',headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title: this.title, description:this.description, imageUrl:this.imageUrl })
        });
          this.$router.push(`/post/${this.pid}`)}
        },
    created(){this.getPost()}}

export default postedit