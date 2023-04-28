const createpost = {
  template:
  `
  <div>
  <h1>Create a new blog post</h1>
  <form @submit.prevent="submitForm">
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
        title: '',
        imageUrl: '',
        description: ''
      }
    },
    
    methods: {
      submitForm() {
        const response = fetch('http://127.0.0.1:5000/post/blog', {method: 'POST', 
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ title: this.title, description:this.description, imageUrl:this.imageUrl })
          });
        this.$router.push('/')}}
        }

export default createpost