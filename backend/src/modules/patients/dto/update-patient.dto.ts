export class UpdatePatientDto {
  firstName?: string;
  lastName?: string;
  phone?: string;
  address?: string;
  gender?: string;
  birthYear?: string;
  bloodType?: string;
  allergies?: string;
  medicalHistory?: string;
  emergencyContacts?: { name: string; relationship: string; phone: string }[];
}
