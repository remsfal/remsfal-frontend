import axios from 'axios';

export interface Address {
  street: string;
  city: string;
  province: string;
  zip: string;
  countryCode: string;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  address: Address;
  mobilePhoneNumber: string;
  businessPhoneNumber: string;
  privatePhoneNumber: string;
  registeredDate: string;
  lastLoginDate: string;
}

export default class UserService {
  private readonly url: string = '/api/v1/user';

  getUser(): Promise<User | void> {
    return axios
      .get(`${this.url}`)
      .then((response) => {
        const user: User = response.data;
        console.log('GET user:', user);
        return user;
      })
      .catch((error) => {
        console.error('GET user failed:', error);
      });
  }

  getCityFromZip(zip: string): Promise<Address[] | void> {
    return axios
      .get(`/api/v1/address`, {
        params: { zip: zip },
      })
      .then((response) => {
        const city: Address[] = response.data;
        console.log('GET user:', city);
        return city;
      })
      .catch((error) => {
        console.error('GET user failed:', error);
      });
  }

  updateUser(updatedUser: Partial<User>): Promise<User | void> {
    return axios
      .patch(`${this.url}`, updatedUser)
      .then((response) => {
        const user: User = response.data;
        console.log('PATCH user successful:', user);
        return user;
      })
      .catch((error) => {
        if (error.response) {
          // Server hat eine spezifische Fehlermeldung gesendet
          console.error('Server-Fehler:', error.response.data);
        } else if (error.request) {
          // Keine Antwort vom Server erhalten
          console.error('Keine Antwort vom Server:', error.request);
        } else {
          // Fehler beim Erstellen der Anfrage
          console.error('Fehler bei der Anfrage:', error.message);
        }
        throw error; // Fehler erneut werfen, um es im Aufrufer abzufangen
      });
  }


  deleteUser(): Promise<boolean> {
    return axios
      .delete(`${this.url}`)
      .then(() => {
        console.log('DELETE user');
        return true;
      })
      .catch((error) => {
        console.error('DELETE user failed:', error);
        return false;
      });
  }
}
