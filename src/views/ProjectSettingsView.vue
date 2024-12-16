<script lang="ts" setup>
import { ref, onMounted } from "vue";
import ProjectMemberService from "../services/ProjectMemberService";
import { useRoute } from "vue-router";
import type { ProjectMember } from "../services/ProjectMemberService"

const props =  defineProps<{
  projectId: string
}>();


const route = useRoute();

let projectId: string = props.projectId;
if (!props.projectId){
  projectId = route.params.projectId as string;
}


const newMemberEmail = ref("");
const newMemberRole = ref("");
const members = ref<ProjectMember[]>([]);
const roles = ["MANAGER", "TENANCY", "PROPRIETOR", "LESSOR", "CARETAKER", "CONTRACTOR"];
const error = ref<string | null>(null);

const fetchMembers = async () => {
  try {
    const fetchedMembers = await ProjectMemberService.getMembers(projectId);
    console.log("Fetched members:", fetchedMembers);
    members.value = fetchedMembers;
  } catch (err) {
    console.error("Failed to fetch members", err);
  }
};

const addMember = async () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!newMemberEmail.value || !emailRegex.test(newMemberEmail.value)) {
    console.error("Invalid email format.");
    return;
  }
  const member: ProjectMember = {email: newMemberEmail.value, role: newMemberRole.value}
  try {
    console.log("Adding member with email:", newMemberEmail.value, "role:", newMemberRole.value);
    await ProjectMemberService.addMember(projectId, member);
    newMemberEmail.value = "";
    newMemberRole.value = "";
    await fetchMembers();
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error("Failed to add member:", err.response?.data || err.message);
  }
};

const updateMemberRole = async (member: ProjectMember, role: string) => {
  console.log("Member object passed to updateMemberRole:", member);
  try {
    await ProjectMemberService.updateMemberRole(projectId, member, role);
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    console.error("Failed to update member role:", err.response?.data || err.message);
  }
};

const removeMember = async (memberId: string) => {
  console.log("Removing member with projectId:", projectId, "memberId:", memberId);

  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(memberId)) {
    console.error("Invalid memberId format:", memberId);
    return;
  }

  try {
    await ProjectMemberService.removeMember(projectId, memberId);
    await fetchMembers();
    console.log("Member removed successfully");
  } catch (error) {
    const err = error as { response?: { data: any }; message: string };
    if (err.response) {
      console.error("Error response:", err.response.data);
    } else {
      console.error("Unexpected error:", err.message);
    }
  }
};

onMounted(() => {
  fetchMembers();
});
</script>

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
          <select v-model="member.role" @change="updateMemberRole(member, member.role ?? '')">
            <option v-for="role in roles" :key="role" :value="role">{{ role }}</option>
          </select>
        </td>
        <td>
          <button @click="removeMember(member.id ?? '')" class="deactivate-btn">deaktivieren</button>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


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
