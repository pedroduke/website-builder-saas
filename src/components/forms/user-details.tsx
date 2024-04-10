'use client';

import {
  changeUserPermissions,
  getAuthUserDetails,
  getUserPermissions,
  saveActivityLogsNotification,
  updateUser,
} from '@/lib/queries';
import {
  AuthUserWithAgencySidebarOptionsSubAccounts,
  UserWithPermissionsAndSubAccounts,
} from '@/lib/types';
import { useModal } from '@/providers/modal-provider';
import { zodResolver } from '@hookform/resolvers/zod';
import { SubAccount, User } from '@prisma/client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { v4 } from 'uuid';
import { z } from 'zod';

import FileUpload from '../global/file-upload';
import { Button } from '../ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '../ui/form';
import { Input } from '../ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { Separator } from '../ui/separator';
import { Switch } from '../ui/switch';
import { useToast } from '../ui/use-toast';

type UserDetailsProps = {
  id: string | null;
  type: 'agency' | 'subaccount';
  userData?: Partial<User>;
  subAccounts?: SubAccount[];
};

const UserDetails = ({ id, type, userData, subAccounts }: UserDetailsProps) => {
  const [subAccountPermissions, setSubAccountPermissions] =
    useState<UserWithPermissionsAndSubAccounts | null>(null);

  const { data, setClose } = useModal();
  const [roleState, setRoleState] = useState('');
  const [loadingPermissions, setLoadingPermissions] = useState(false);
  const [authUserData, setAuthUserData] =
    useState<AuthUserWithAgencySidebarOptionsSubAccounts | null>();
  const { toast } = useToast();
  const router = useRouter();

  useEffect(() => {
    if (data.user) {
      const fetchDetails = async () => {
        const response = await getAuthUserDetails();
        if (response) {
          setAuthUserData(response);
        }
      };
      fetchDetails();
    }
  }, [data]);

  const userDataSchema = z.object({
    name: z.string().min(1),
    email: z.string().email(),
    avatarUrl: z.string(),
    role: z.enum(['AGENCY_OWNER', 'AGENCY_ADMIN', 'SUBACCOUNT_USER', 'SUBACCOUNT_GUEST']),
  });

  const form = useForm<z.infer<typeof userDataSchema>>({
    resolver: zodResolver(userDataSchema),
    mode: 'onChange',
    defaultValues: {
      name: userData ? userData.name : data?.user?.name,
      email: userData ? userData.email : data?.user?.email,
      avatarUrl: userData ? userData.avatarUrl : data?.user?.avatarUrl,
      role: userData ? userData.role : data?.user?.role,
    },
  });

  useEffect(() => {
    if (!data.user) return;

    const getPermissions = async () => {
      if (!data.user) return;
      const permission = await getUserPermissions(data.user.id);
      setSubAccountPermissions(permission);
    };

    getPermissions();
  }, [data, form]);

  useEffect(() => {
    if (data.user) {
      form.reset(data.user);
    }
    if (userData) {
      form.reset(userData);
    }
  }, [userData, data]);

  const onChangePermission = async (
    subAccountId: string,
    value: boolean,
    permissionsId: string | undefined,
  ) => {
    if (!data?.user?.email) return;

    setLoadingPermissions(true);

    const response = await changeUserPermissions(
      permissionsId ? permissionsId : v4(),
      data.user.email,
      subAccountId,
      value,
    );

    if (type === 'agency') {
      await saveActivityLogsNotification({
        agencyId: authUserData?.Agency?.id,
        description: `Gave ${userData?.name} access to | ${
          subAccountPermissions?.Permissions.find(
            (permission) => permission.subAccountId === subAccountId,
          )?.SubAccount.name
        } `,
        subaccountId: subAccountPermissions?.Permissions.find(
          (p) => p.subAccountId === subAccountId,
        )?.SubAccount.id,
      });
    }

    if (response) {
      toast({
        title: 'Success',
        description: 'The request was successfull',
      });
    }

    if (subAccountPermissions) {
      subAccountPermissions.Permissions.find((permission) => {
        if (permission.subAccountId === subAccountId) {
          return { ...permission, access: !permission.access };
        }
        return permission;
      });
    } else {
      toast({
        variant: 'destructive',
        title: 'Failed',
        description: 'Could not update permissions',
      });
    }

    router.refresh();
    setLoadingPermissions(false);
  };

  const onSubmit = async (values: z.infer<typeof userDataSchema>) => {
    if (!id) return;

    if (userData || data?.user) {
      const updatedUser = await updateUser(values);
      authUserData?.Agency?.SubAccount.filter((subacc) =>
        authUserData.Permissions.find((p) => p.subAccountId === subacc.id && p.access),
      ).forEach(async (subaccount) => {
        await saveActivityLogsNotification({
          agencyId: undefined,
          description: `Updated ${userData?.name} information`,
          subaccountId: subaccount.id,
        });
      });

      if (updatedUser) {
        toast({
          title: 'Success',
          description: 'Update User Information',
        });
        setClose();
        router.refresh();
      } else {
        toast({
          variant: 'destructive',
          title: 'Oopps!',
          description: 'Could not update user information',
        });
      }
    } else {
      console.log('Error could not submit');
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>User Details</CardTitle>
        <CardDescription>Add or update your information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="avatarUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile picture</FormLabel>
                  <FormControl>
                    <FileUpload
                      apiEndpoint="avatar"
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Full Name</FormLabel>
                  <FormControl>
                    <Input required placeholder="Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      readOnly={userData?.role === 'AGENCY_OWNER' || form.formState.isSubmitting}
                      placeholder="Email"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              disabled={form.formState.isSubmitting}
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem className="flex-1">
                  <FormLabel>User Role</FormLabel>
                  <Select
                    disabled={field.value === 'AGENCY_OWNER'}
                    onValueChange={(value) => {
                      if (value === 'SUBACCOUNT_USER' || value === 'SUBACCOUNT_GUEST') {
                        setRoleState(
                          'You need to have sub accounts to assign Sub account access to team members.',
                        );
                      } else {
                        setRoleState('');
                      }
                      field.onChange(value);
                    }}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select User Role..." />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="AGENCY_ADMING">Agency Admin</SelectItem>
                      {(data?.user?.role === 'AGENCY_OWNER' ||
                        userData?.role === 'AGENCY_OWNER') && (
                        <SelectItem value="AGENCY_OWNER">Agency Owner</SelectItem>
                      )}
                      <SelectItem value="SUBACCOUNT_USER">Sub Account User</SelectItem>
                      <SelectItem value="SUBACCOUNT_GUEST">Sub Account Guest</SelectItem>
                    </SelectContent>
                  </Select>
                  <p className="text-muted-foreground">{roleState}</p>
                </FormItem>
              )}
            />

            <Button className="text-white" disabled={form.formState.isSubmitting} type="submit">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving User Details...
                </>
              ) : (
                'Save User Details'
              )}
            </Button>
            {authUserData?.role === 'AGENCY_OWNER' && (
              <div>
                <Separator className="my-4" />
                <FormLabel>User Permissions</FormLabel>
                <FormDescription className="mb-4">
                  You can give Sub Account access to team members by turning on access control for
                  each Sub Account. This is only visible to Agency Owners
                </FormDescription>
                <div className="flex flex-col gap-4">
                  {subAccounts?.map((subAccount) => {
                    const subAccountPermissionsDetails = subAccountPermissions?.Permissions.find(
                      (permission) => permission.subAccountId === subAccount.id,
                    );

                    return (
                      <div
                        key={subAccount.id}
                        className="flex flex-col items-center justify-center rounded-lg border p-4"
                      >
                        <div>
                          <p>{subAccount.name}</p>
                        </div>
                        <Switch
                          disabled={loadingPermissions}
                          checked={subAccountPermissionsDetails?.access}
                          onCheckedChange={(permission) => {
                            onChangePermission(
                              subAccount.id,
                              permission,
                              subAccountPermissionsDetails?.id,
                            );
                          }}
                        />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default UserDetails;
