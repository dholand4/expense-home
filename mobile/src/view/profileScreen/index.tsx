import { Ionicons } from '@expo/vector-icons';
import { zodResolver } from '@hookform/resolvers/zod';
import React, { useState } from 'react';
import { ActivityIndicator, Modal, ScrollView, Text, View } from 'react-native';
import * as Updates from 'expo-updates';
import Toast from 'react-native-toast-message';
import { confirmModalGlobal as ConfirmModal } from '../../components/confirmModalGlobal';
import { Controller, useForm } from 'react-hook-form';
import { useTheme } from 'styled-components/native';
import { z } from 'zod';
import { buttonGlobal as ButtonGlobal } from '../../components/buttonGlobal';
import { inputGlobal as InputGlobal } from '../../components/inputGlobal';
import { FluidModalGlobal } from '../../components/fluidModalGlobal';
import { useAuth } from '../../hooks/useAuth';
import { useSharedAccesses } from '../../hooks/useSharedAccesses';
import { useUsers } from '../../hooks/useUsers';
import { CloseButton, ModalCard, ModalContent, ModalOverlay, ModalTitle, TitleRow } from '../../components/expenseFormGlobal/style';
import { useProfile } from '../../providers/profileProvider';
import {
  AccessCard, AccessEmail, AccessRow, ActionRow,
  Avatar, AvatarText, BackButton, Container, DangerItem, DangerLabel,
  EmptyText, Header, ItemLabel, RoleBadge, RoleText, Safe,
  Section, SectionItem, SectionTitle, SmallButton, SmallButtonText,
  StatusBadge, StatusText, TabBar, TabButton, TabButtonText,
  TopBar, UserCard, UserCardEmail, UserCardName, UserEmail, UserName,
} from './style';

const inviteSchema = z.object({
  email: z.string().email('E-mail inválido'),
});
type IInviteForm = z.infer<typeof inviteSchema>;

type ITab = 'profile' | 'accesses' | 'users';

function statusLabel(status: string) {
  if (status === 'accepted') return 'Aceito';
  if (status === 'rejected') return 'Recusado';
  return 'Pendente';
}

export function ProfileScreen() {
  const theme = useTheme();
  const { closeProfile } = useProfile();
  const { user, logout } = useAuth();
  const { accesses, invite, accept, reject, revoke } = useSharedAccesses();
  const { users, updateRole, removeUser } = useUsers();

  const [activeTab, setActiveTab] = useState<ITab>('profile');
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [revokeTarget, setRevokeTarget] = useState<{ id: string; email: string } | null>(null);
  const [removeTarget, setRemoveTarget] = useState<{ id: string; name: string } | null>(null);
  const [checkingUpdate, setCheckingUpdate] = useState(false);

  const handleLogout = async () => {
    setShowLogoutConfirm(false);
    closeProfile();
    await logout();
  };

  const handleCheckUpdate = async () => {
    if (!Updates.isEnabled) {
      Toast.show({
        type: 'info',
        text1: 'OTA não ativo neste build',
        text2: 'Gere um novo APK com "npm run build:apk" para ativar atualizações sem reinstalação.',
        visibilityTime: 5000,
      });
      return;
    }
    setCheckingUpdate(true);
    try {
      const check = await Updates.checkForUpdateAsync();
      if (check.isAvailable) {
        Toast.show({
          type: 'info',
          text1: '⚡ Baixando atualização...',
          text2: 'Aguarde um instante.',
        });
        await Updates.fetchUpdateAsync();
        Toast.show({
          type: 'success',
          text1: '✅ Atualização concluída!',
          text2: 'Reiniciando o aplicativo...',
        });
        setTimeout(() => Updates.reloadAsync(), 1500);
      } else {
        Toast.show({
          type: 'success',
          text1: 'Aplicativo atualizado!',
          text2: 'Você já está com a versão mais recente.',
        });
      }
    } catch (err: any) {
      Toast.show({
        type: 'error',
        text1: 'Erro ao verificar atualizações',
        text2: err?.message || 'Tente novamente mais tarde.',
      });
    } finally {
      setCheckingUpdate(false);
    }
  };

  const inviteForm = useForm<IInviteForm>({ resolver: zodResolver(inviteSchema) });

  const initials = user?.full_name
    ? user.full_name.split(' ').slice(0, 2).map((n) => n[0]).join('').toUpperCase()
    : '?';

  const handleInvite = async (data: IInviteForm) => {
    setIsSubmitting(true);
    try {
      await invite(data.email);
      inviteForm.reset();
      setShowInviteModal(false);
    } catch {
    } finally {
      setIsSubmitting(false);
    }
  };

  const grantedAccesses = accesses.filter((a) => a.owner_email === user?.email);
  const receivedAccesses = accesses.filter((a) => a.shared_with_email === user?.email);

  return (
    <Safe>
      <TopBar>
        <BackButton onPress={closeProfile}>
          <Ionicons name="chevron-back" size={24} color={theme.colors.primary} />
        </BackButton>
      </TopBar>

      <Container showsVerticalScrollIndicator={false}>
        <Header>
          <Avatar>
            <AvatarText>{initials}</AvatarText>
          </Avatar>
          <UserName>{user?.full_name ?? 'Usuário'}</UserName>
          <UserEmail>{user?.email ?? ''}</UserEmail>
          {user?.role && (
            <RoleBadge>
              <RoleText>{user.role === 'admin' ? 'Administrador' : 'Usuário'}</RoleText>
            </RoleBadge>
          )}
        </Header>

        <TabBar>
          <TabButton active={activeTab === 'profile'} onPress={() => setActiveTab('profile')}>
            <TabButtonText active={activeTab === 'profile'}>Perfil</TabButtonText>
          </TabButton>
          <TabButton active={activeTab === 'accesses'} onPress={() => setActiveTab('accesses')}>
            <TabButtonText active={activeTab === 'accesses'}>Acessos</TabButtonText>
          </TabButton>
          {user?.role === 'admin' && (
            <TabButton active={activeTab === 'users'} onPress={() => setActiveTab('users')}>
              <TabButtonText active={activeTab === 'users'}>Usuários</TabButtonText>
            </TabButton>
          )}
        </TabBar>

        {activeTab === 'profile' && (
          <>
            <Section>
              <SectionTitle>Atualizações do Aplicativo</SectionTitle>
              <View style={{ padding: 16 }}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Versão Base</Text>
                  <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>1.0.0</Text>
                </View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                  <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Status OTA</Text>
                  <Text style={{ color: Updates.isEnabled ? theme.colors.primary : theme.colors.warning, fontSize: 13, fontWeight: '600' }}>
                    {Updates.isEnabled
                      ? (Updates.isEmbeddedLaunch ? 'Versão base (aguardando OTA)' : 'Atualizado via nuvem')
                      : 'Não habilitado neste APK'}
                  </Text>
                </View>
                {Updates.channel && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Canal</Text>
                    <Text style={{ color: theme.colors.text, fontSize: 13, fontWeight: '600' }}>{Updates.channel}</Text>
                  </View>
                )}
                {Updates.updateId && (
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 13 }}>Pacote Ativo</Text>
                    <Text style={{ color: theme.colors.textSecondary, fontSize: 12 }}>
                      {Updates.updateId.slice(0, 8)}...
                    </Text>
                  </View>
                )}
              </View>
              <SectionItem onPress={handleCheckUpdate} disabled={checkingUpdate}>
                {checkingUpdate ? (
                  <ActivityIndicator size="small" color={theme.colors.primary} />
                ) : (
                  <Ionicons name="cloud-download-outline" size={20} color={theme.colors.primary} />
                )}
                <ItemLabel style={{ color: theme.colors.primary }}>
                  {checkingUpdate ? 'Verificando atualizações...' : 'Verificar atualizações agora'}
                </ItemLabel>
              </SectionItem>
            </Section>

            <Section>
              <DangerItem onPress={() => setShowLogoutConfirm(true)}>
                <Ionicons name="log-out-outline" size={20} color={theme.colors.error} />
                <DangerLabel>Sair da conta</DangerLabel>
              </DangerItem>
            </Section>
          </>
        )}

        {activeTab === 'accesses' && (
          <View>
            <SectionTitle style={{ paddingHorizontal: 0, marginBottom: 8 }}>Acessos concedidos por mim</SectionTitle>
            {grantedAccesses.length === 0 ? (
              <EmptyText>Nenhum acesso concedido</EmptyText>
            ) : (
              grantedAccesses.map((a) => (
                <AccessCard key={a.id}>
                  <AccessRow>
                    <AccessEmail numberOfLines={1}>{a.shared_with_email}</AccessEmail>
                    <StatusBadge status={a.status}>
                      <StatusText status={a.status}>{statusLabel(a.status)}</StatusText>
                    </StatusBadge>
                  </AccessRow>
                  {a.status !== 'rejected' && (
                    <ActionRow>
                      <SmallButton variant="danger" onPress={() => setRevokeTarget({ id: a.id, email: a.shared_with_email })}>
                        <SmallButtonText variant="danger">Revogar</SmallButtonText>
                      </SmallButton>
                    </ActionRow>
                  )}
                </AccessCard>
              ))
            )}
            <SmallButton
              style={{ marginBottom: 16, alignSelf: 'flex-start' }}
              onPress={() => setShowInviteModal(true)}
            >
              <SmallButtonText>+ Convidar usuário</SmallButtonText>
            </SmallButton>

            <SectionTitle style={{ paddingHorizontal: 0, marginBottom: 8 }}>Acessos recebidos</SectionTitle>
            {receivedAccesses.length === 0 ? (
              <EmptyText>Nenhum convite recebido</EmptyText>
            ) : (
              receivedAccesses.map((a) => (
                <AccessCard key={a.id}>
                  <AccessRow>
                    <AccessEmail numberOfLines={1}>{a.owner_email}</AccessEmail>
                    <StatusBadge status={a.status}>
                      <StatusText status={a.status}>{statusLabel(a.status)}</StatusText>
                    </StatusBadge>
                  </AccessRow>
                  {a.status === 'pending' && (
                    <ActionRow>
                      <SmallButton variant="success" onPress={() => accept(a.id)}>
                        <SmallButtonText variant="success">Aceitar</SmallButtonText>
                      </SmallButton>
                      <SmallButton variant="danger" onPress={() => reject(a.id)}>
                        <SmallButtonText variant="danger">Recusar</SmallButtonText>
                      </SmallButton>
                    </ActionRow>
                  )}
                </AccessCard>
              ))
            )}
          </View>
        )}

        {activeTab === 'users' && user?.role === 'admin' && (
          <View>
            <SectionTitle style={{ paddingHorizontal: 0, marginBottom: 8 }}>Usuários do sistema</SectionTitle>
            {users.length === 0 ? (
              <EmptyText>Nenhum usuário encontrado</EmptyText>
            ) : (
              users.map((u) => (
                <UserCard key={u.id}>
                  <AccessRow>
                    <View style={{ flex: 1 }}>
                      <UserCardName>{u.full_name}</UserCardName>
                      <UserCardEmail>{u.email}</UserCardEmail>
                    </View>
                    <StatusBadge status="accepted">
                      <StatusText status="accepted">{u.role === 'admin' ? 'Admin' : 'Usuário'}</StatusText>
                    </StatusBadge>
                  </AccessRow>
                  {u.id !== user.id && (
                    <ActionRow>
                      <SmallButton
                        variant="warning"
                        onPress={() => updateRole({ id: u.id, role: u.role === 'admin' ? 'user' : 'admin' })}
                      >
                        <SmallButtonText variant="warning">
                          {u.role === 'admin' ? 'Rebaixar' : 'Promover'}
                        </SmallButtonText>
                      </SmallButton>
                      <SmallButton variant="danger" onPress={() => setRemoveTarget({ id: u.id, name: u.full_name })}>
                        <SmallButtonText variant="danger">Remover</SmallButtonText>
                      </SmallButton>
                    </ActionRow>
                  )}
                </UserCard>
              ))
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </Container>

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Sair da conta"
        message="Deseja realmente sair?"
        confirmLabel="Sair"
        onConfirm={handleLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <ConfirmModal
        visible={!!revokeTarget}
        title={`Revogar acesso de ${revokeTarget?.email ?? ''}?`}
        confirmLabel="Revogar"
        onConfirm={async () => { if (revokeTarget) { await revoke(revokeTarget.id); setRevokeTarget(null); } }}
        onCancel={() => setRevokeTarget(null)}
      />

      <ConfirmModal
        visible={!!removeTarget}
        title={`Remover ${removeTarget?.name ?? ''}?`}
        confirmLabel="Remover"
        onConfirm={async () => { if (removeTarget) { await removeUser(removeTarget.id); setRemoveTarget(null); } }}
        onCancel={() => setRemoveTarget(null)}
      />

      <FluidModalGlobal
        visible={showInviteModal}
        onClose={() => setShowInviteModal(false)}
        title="Convidar usuário"
        subtitle="Compartilhe o acesso às despesas da casa"
      >
        <ScrollView
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 28 }}
        >
          <Controller control={inviteForm.control} name="email" render={({ field }) => (
            <InputGlobal
              label="E-mail"
              placeholder="usuario@email.com"
              keyboardType="email-address"
              autoCapitalize="none"
              value={field.value}
              onChangeText={field.onChange}
              error={inviteForm.formState.errors.email?.message}
            />
          )} />
          <View style={{ marginTop: 12 }}>
            <ButtonGlobal label="Enviar convite" onPress={inviteForm.handleSubmit(handleInvite)} loading={isSubmitting} />
          </View>
        </ScrollView>
      </FluidModalGlobal>
    </Safe>
  );
}
