<template>

  <h1>Mitglieder einer Liegenschaft</h1>

  <h3>Mitglied hinzufügen</h3>

  <div v-if="error" class="error">{{ error }}</div>

  <div class="project-settings">
    <div>
      <input
          v-model="newMemberEmail"
          type="email"
          placeholder="E-Mail des neuen Mitglieds"
      />
      <select v-model="newMemberRole">
      <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
      </select>
      <button @click="addMember" class="create-btn">erstellen</button>
    </div>

  <h3>Mitgliederliste</h3>

    <table>
      <thead>
      <tr>
        <th>Email</th>
        <th>Rolle</th>
        <th>Optionen</th>
      </tr>
      </thead>
      <tbody>
      <tr v-for="member in members" :key="member.id">
        <td>{{ member.email }}</td>
        <td>
          <select v-model="member.role" @change="updateMemberRole(member)">
            <option v-for="role in roles" :value="role">{{ role }}</option>
          </select>
        </td>
        <td>
          <button @click="removeMember(member.id)" class="deactivate-btn">deaktivieren</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import ProjectMemberService from "../services/ProjectMemberService";

export default{
props: {
  projectId: {
    type: String,
        required: true,
  },
},

  data() {
    return {
      newMemberEmail: "",
      newMemberRole: "",
      members: [],
      roles: ["MANAGER", "TENANCY", "PROPRIETOR", "LESSOR", "CARETAKER", "CONTRACTOR"],
      error: null,
    };
  },

  methods: {
    async fetchMembers() {
      try {
        const projectId = this.$route.params.projectId;
        const members = await ProjectMemberService.getMembers(projectId);
        console.log("Fetched members:", members); // Prüfe, ob die `id` enthalten ist
        this.members = members;
      } catch (error) {
        console.error("Failed to fetch members", error);
      }
    },

    async addMember() {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!this.newMemberEmail || !emailRegex.test(this.newMemberEmail)) {
        console.error("Invalid email format.");
        return;
      }

      try {
        console.log("Adding member with email:", this.newMemberEmail, "role:", this.newMemberRole);
        await ProjectMemberService.addMember(this.projectId, {
          email: this.newMemberEmail,
          role: this.newMemberRole || "MANAGER",
        });
        this.newMemberEmail = "";
        this.newMemberRole = "";
        await this.fetchMembers();
      } catch (error) {
        console.error("Failed to add member:", error.response?.data || error.message);
      }
    },

    async updateMemberRole(member) {
      console.log("Member object passed to updateMemberRole:", member);
      try {
        await ProjectMemberService.updateMemberRole(this.projectId, member, member.role);
      } catch (error) {
        console.error("Failed to update member role:", error);
      }
    },

    async removeMember(memberId) {
      console.log("Removing member with projectId:", this.projectId, "memberId:", memberId);

      // Überprüfen, ob die memberId eine gültige UUID ist
      const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
      if (!uuidRegex.test(memberId)) {
        console.error("Invalid memberId format:", memberId);
        return;
      }

      try {
        await ProjectMemberService.removeMember(this.projectId, memberId);
        await this.fetchMembers();
        console.log("Member removed successfully");
      } catch (error) {
        if (error.response) {
          console.error("Error response:", error.response.data);
        } else {
          console.error("Unexpected error:", error.message);
        }
      }
    },
  },

  created() {
    this.fetchMembers();
  },
};
</script>


<style scoped>
.project-settings {
  padding: 20px;
}

input {
  margin-right: 10px;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

table, th, td {
  border: 1px solid #ddd;
}

th, td {
  padding: 8px;
  text-align: left;
}

button.create-btn {
  background-color: #4CAF50;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  display: inline-block;
  font-size: 12px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

button.create-btn:hover {
  background-color: #45a049;
}

button.deactivate-btn {
  background-color: #f44336;
  color: white;
  border: none;
  padding: 5px 10px;
  text-align: center;
  display: inline-block;
  font-size: 12px;
  cursor: pointer;
  border-radius: 5px;
  transition: background-color 0.3s ease;
}

button.deactivate-btn:hover {
  background-color: #e53935;
}

</style>
