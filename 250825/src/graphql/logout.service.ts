import { gql } from '@apollo/client';

export const LOGOUT_MUTATION = gql`
  mutation Logout {
    logout {
      status
      message
      statusCode
      data
      error
    }
  }
`;

export const ADMIN_LOGOUT_MUTATION = gql`
  mutation Adminlogout {
    adminlogout {
      status
      message
      statusCode
      data
      error
    }
  }
`;

// TypeScript interfaces for the responses
export interface LogoutResponse {
  status: string;
  message: string;
  statusCode: number;
  data?: any;
  error?: string;
}

export interface LogoutData {
  logout: LogoutResponse;
}

export interface AdminLogoutData {
  adminlogout: LogoutResponse;
}
